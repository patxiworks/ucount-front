
export const PageTitle = ({ event }) => {
    return (
      <div className="text-xl mb-2 text-green-700">
        <span>Current activity:</span> 
        <h2>{event?.name}</h2>
      </div>
    )
}