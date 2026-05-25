export const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR");
  } catch {
    return dateStr;
  }
};
