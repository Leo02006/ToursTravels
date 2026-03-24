export const formatDate = (date: string | Date | number): string => {
  if (!date) return 'N/A';
  
  let d: Date;
  if (typeof date === 'string' && date.includes('-')) {
    const parts = date.split('-');
    // If it's DD-MM-YYYY (e.g. 05-12-2026)
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) return 'N/A';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
};
