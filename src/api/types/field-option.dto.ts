type FieldOptionType = {
  id: string;
  name: string;
};

export type GetFieldOptionByTypeResponseType = FieldOptionType[];

export type OptionType = {
  label: string;
  value: string | number;
};
