let db;

// Connect indexdb database 'budget-tracker'
const request = indexedDB.open('budget-tracker', 1)

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new-transaction', { autoIncrement: true });
}

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    uploadTransactions();
  }
};

request.onerror = function(event) {
  // console.log the errors
  console.log(event.target.errorCode);
};

// Function for new withdrawals. Open transaction in db, access object store and get all records.
function saveRecord(record) {
  const transaction = db.transaction(['new-transaction'], 'readwrite');
  const newtransactionObjectStore = transaction.objectStore('new-transaction');
  const getAll = newtransactionObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message){
            throw new Error(serverResponse);
          }
          // code from like above -- make sure things match
          const transaction = db.transaction(['new-transaction'], 'readwrite');
          const newtransactionObjectStore = transaction.objectStore('new-transaction');
          newtransactionObjectStore.clear();
        })
        .catch(err => {
          console.log(err);
        })
    }
  };
}

// Check for network status changes
window.addEventListener('online', uploadTransactions);