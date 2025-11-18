const dataToMigrateScheme = [
  {
    id: 1,
    title: "VH Fire",
    code: "V12ONKED3FY34RVHI",
    description:
      "<ul><li><strong>សាច់ក្រើម ទន់ ត្រជាក់</strong></li><li><strong>SIZE: S M L XL XXL XXXL</strong></li><li><strong>8 COLORS: White(ស), Grey(ប្រផេះ), Blue(ខៀវ), Pink(ផ្កាឈូក), Black(ខ្មៅ), Green(បៃតង), Navy Blue(ទឹកប៊ិចក្រម៉ៅ), Kabstang(កាប់ស្តាំង)</strong></li></ul>",
    price: 6.0,
    discount: 0.0,
    stock: 220,
    color: "White ,Black,Blue,Pink,Grey,Kabstang,Green,Navy Blue",
    size: "S,M,L,XL,XXL,XXXL",
    unit: "",
    picture: "https://panhara.sgp1.digitaloceanspaces.com/1701748620045.jpg",
    category: 4,
    created_by: 0,
    published: 1,
    created_at: "2023-12-05 04:23:39",
    updated_at: "2023-12-05 04:23:39",
    images:
      "https://panhara.sgp1.digitaloceanspaces.com/1701748620045.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748620265.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748620486.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748620828.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748621133.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748621502.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748621824.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748622136.jpg,https://panhara.sgp1.digitaloceanspaces.com/1701748622440.jpg",
    price_hold_sale: 3.5,
    price_premium: 3.3,
    discount_hold_sale: 0.0,
    discount_premium: -1.0,
    pin_default: 1,
  },
];

const newProductSchemaWithDataFromDataToMigrateScheme = 
	[
		{
			"id": 1,
			"slug": "",
			"title": "",
			"description": "",
			"productCode": "",
			"status": "",
			"price": 0,
			"salePriceHold": null,
			"discountHold": null,
			"salePricePremium": null,
			"discountPremium": null,
			"categoryId": 1,
			"createdAt": "",
			"updatedAt": "",
			"discount": null
		},
	]
