if (typeof window !== 'undefined') {
  const storage = localStorage.getItem('aegis-storage');
  console.log('Storage:', storage ? JSON.parse(storage) : 'empty');
}
