export const currencyFormat = (num: string | number) => {
  return num
    ? "$" +
        Number(num)
          .toFixed(2)
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    : "$0.00";
};

export const currencyToNumber = (num: string) => {
  return typeof num === "string" ? Number(num.replace(/[^0-9.-]+/g, "")) : 0;
};

export const isCurrency = (num: string) => {
  return /^\$[0-9]+[.]{0,1}[0-9]*$/.test(num);
};
