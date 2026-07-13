import moment from "moment";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getDateTime = (date: Date): string => {
  var checkedDate = moment(date, "YYYY/MM/DD");
  var month = checkedDate.format("MMMM");
  var day = checkedDate.format("D");
  var year = checkedDate.format("YYYY");
  return day + " " + month + ", " + year;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};
const getTodayDateTime = (d?: any): string => {
  let date = d ? new Date(d) : new Date();
  // const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateString = (isoString: any) => {
  if (!isoString) return "";
  return isoString.split("T")[0];
};

export {
  formatCurrency,
  formatDate,
  formatDateString,
  getDateTime,
  getTodayDateTime,
};
