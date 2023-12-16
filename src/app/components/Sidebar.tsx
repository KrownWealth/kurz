
const Sidebar: React.FC<{ history: string[] }> = ({ history }) => {
  return (
   
     
    <div className="sidebar">
    <h2 className="pb-4 font-bold">Graspr AI</h2>
      <ul className="space-y-4 border p-4 h-screen">
        {history.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
   
    
  );
};

export default Sidebar;
