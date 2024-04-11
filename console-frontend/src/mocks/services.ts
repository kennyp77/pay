export const services = {
  services_list: [
    {
      name: 'Битрикс',
      logo_url: '/bitrix-logo.svg',
      install_text: 'Установите модуль из каталога дополнений Битрикс:',
      install_module: {
        name: 'Модуль для CMS Битрикс',
        link: 'http://marketplace.1c-bitrix.ru/solutions/yandexpay.pay/',
      },
    },
    // {
    //   name: 'WooCommerce',
    //   logo_url: '/woo-commerce-logo.svg',
    //   install_text: 'Установите модуль из каталога дополнений WooCommerce:',
    //   install_module: {
    //     name: 'Модуль для WooCommerce',
    //     link: 'http://google.com',
    //   },
    // },
    {
      name: 'Другая',
      name_long: 'У меня другая CMS',
      logo_url: '/another-logo.svg',
      is_another: true,
    },
  ],
  suggest_services_list: [
    {
      name: 'Drupal',
    },
    {
      name: 'ModX',
    },
    {
      name: 'Joomla',
    },
    {
      name: 'OpenCart',
    },
    {
      name: 'WooCommerce',
    },
    {
      name: 'Shopify',
    },
    {
      name: 'Shop-script',
    },
  ],
};
