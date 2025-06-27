import React, { useState } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const fxRates = {
  KES: 1,
  USD: 140,
  NGN: 0.3,
};

function App() {
  const [internalData, setInternalData] = useState([]);
  const [providerData, setProviderData] = useState([]);
  const [hasCurrency, setHasCurrency] = useState(false);

  const handleFileUpload = (e, isInternal) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const cleanedData = results.data
          .map((row) => {
            const currency = row.currency?.trim()?.toUpperCase();
            const hasValidCurrency = currency && fxRates[currency];

            return {
              transaction_reference: row.transaction_reference?.trim(),
              amount: parseFloat(row.amount?.trim()),
              status: row.status?.trim(),
              currency: hasValidCurrency ? currency : undefined,
            };
          })
          .filter(
            (row) =>
              row.transaction_reference &&
              !isNaN(row.amount) &&
              row.status
          );

        if (cleanedData.some((row) => row.currency)) {
          setHasCurrency(true);
        }

        if (isInternal) {
          setInternalData(cleanedData);
        } else {
          setProviderData(cleanedData);
        }
      },
    });
  };

  const convertToKES = (amount, currency) => {
    return currency && fxRates[currency] ? amount * fxRates[currency] : amount;
  };

  const reconcile = () => {
    const matched = [];
    const internalOnly = [];
    const providerOnly = [];

    const providerMap = new Map();
    providerData.forEach((tx) =>
      providerMap.set(tx.transaction_reference, tx)
    );

    internalData.forEach((tx) => {
      const match = providerMap.get(tx.transaction_reference);
      if (match) {
        const txKES = convertToKES(tx.amount, tx.currency);
        const matchKES = convertToKES(match.amount, match.currency);

        const isAmountMatch = Math.abs(txKES - matchKES) < 1;
        const isStatusMatch = tx.status === match.status;

        if (isAmountMatch && isStatusMatch) {
          matched.push({ internal: tx, provider: match, highlight: false });
        } else {
          internalOnly.push(tx);
          providerOnly.push(match);
        }
        providerMap.delete(tx.transaction_reference);
      } else {
        internalOnly.push(tx);
      }
    });

    providerMap.forEach((tx) => providerOnly.push(tx));

    return { matched, internalOnly, providerOnly };
  };

  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

  const { matched, internalOnly, providerOnly } =
    internalData.length && providerData.length
      ? reconcile()
      : { matched: [], internalOnly: [], providerOnly: [] };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Mini Reconciliation Tool</h1>

      <div>
        <label>Upload Internal File</label>
        <br />
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, true)}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Upload Provider File</label>
        <br />
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileUpload(e, false)}
        />
      </div>

      {internalData.length > 0 && providerData.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>✅ Matched Transactions</h2>
          <button onClick={() => exportToCSV(matched.map(row => ({
            transaction_reference: row.internal.transaction_reference,
            internal_amount: row.internal.amount,
            provider_amount: row.provider.amount,
            internal_status: row.internal.status,
            provider_status: row.provider.status,
            currency: hasCurrency ? row.internal.currency : undefined
          })), 'matched_transactions.csv')}>Export as CSV</button>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Internal Amount</th>
                <th>Provider Amount</th>
                <th>Internal Status</th>
                <th>Provider Status</th>
              </tr>
            </thead>
            <tbody>
              {matched.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: row.highlight ? '#FF0000' : '#0000FF',
                    color: 'white',
                  }}
                >
                  <td>{row.internal.transaction_reference}</td>
                  <td>
                    {row.internal.amount} {hasCurrency && row.internal.currency}
                  </td>
                  <td>
                    {row.provider.amount} {hasCurrency && row.provider.currency}
                  </td>
                  <td>{row.internal.status}</td>
                  <td>{row.provider.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: '2rem' }}>⚠️ Only in Internal File</h2>
          <button onClick={() => exportToCSV(internalOnly, 'only_internal.csv')}>Export as CSV</button>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                {hasCurrency && <th>Currency</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {internalOnly.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.transaction_reference}</td>
                  <td>{tx.amount}</td>
                  {hasCurrency && <td>{tx.currency}</td>}
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: '2rem' }}>❌ Only in Provider File</h2>
          <button onClick={() => exportToCSV(providerOnly, 'only_provider.csv')}>Export as CSV</button>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                {hasCurrency && <th>Currency</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {providerOnly.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.transaction_reference}</td>
                  <td>{tx.amount}</td>
                  {hasCurrency && <td>{tx.currency}</td>}
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
