const ResultsTable = ({ title, data, type }) => {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h2>{title}</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Transaction Ref</th>
              <th>Amount</th>
              <th>Status</th>
              {type === 'matched' && <th>Provider Amount</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{type === 'matched' ? row.internal.transaction_reference : row.transaction_reference}</td>
                <td>{type === 'matched' ? row.internal.amount : row.amount}</td>
                <td>{type === 'matched' ? row.internal.status : row.status}</td>
                {type === 'matched' && <td>{row.provider.amount}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default ResultsTable;
  