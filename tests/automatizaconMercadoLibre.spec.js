import { test, expect } from '@playwright/test';
import { log } from 'console';

test('Busqueda y filtrado en Mercado Libre', async ({ page }) => {
 // await page.pause();
  //Se entra a "mercadolibre.com" y nos direccionamos a "mercadolibre.com.mx"
  await page.goto('https://mercadolibre.com/');
  await page.getByRole('link', { name: 'México' }).click();
  
  //Se realiza la busqueda de "playstation 5"
  await page.getByPlaceholder('Buscar productos, marcas y má').click();
  await page.getByPlaceholder('Buscar productos, marcas y má').fill('playstation 5');
  await page.getByPlaceholder('Buscar productos, marcas y má').press('Enter');
  
  //Se filtra por "Nuevo" y por "Distrito Federal"
  await page.locator('//a[contains(@class, "ui-search-link") and .//span[text()="Nuevo"]]').click();
  await page.locator('//a[contains(@class, "ui-search-link") and .//span[text()="Distrito Federal"]]').click();
  
  //En algunos casos sale una alerta "Conoce el envío a tu ubicación", si se da click en el desplegable antes de que se cargue, se cierran las opciones, por lo cual esperamos a que aparezca la alerta o que pasen 4 segundos.
  const waitButton = page.getByRole('button', {name : 'Agregar código postal'}).waitFor({state:'visible'});
  const waitForTimeout = page.waitForTimeout(4000);
  await Promise.race([waitButton, waitForTimeout]);
  
  //Se ordena de mayor a menor
  await page.getByRole('button', { name : 'Más relevantes Más relevantes'}).click();
  await page.getByRole('option', { name: 'Mayor precio' }).waitFor({state:'visible'});
  await page.getByRole('option', { name: 'Mayor precio' }).click();
  
  //Se almacenan los titulos, el tipo de moneda y los precios en un Array
  
  let titulos = [];
  const numeroProductos = 5;
  //Funcion para evitar que "titulos" tenga menos de 5 elementos.
  async function espera(conteo) {
    while (true) {
      titulos = await page.locator('//h2[contains(@class,"ui-search-item__title")]').allInnerTexts();
      if (titulos.length >= conteo) {
        break;
      }
      await page.waitForTimeout(1000);
    }
  }

  await espera(numeroProductos);
  const monedas = await page.locator('//div[contains(@class, "ui-search-item__group__element")]//div[contains(@class, "ui-search-price")]//div[@class = "ui-search-price__second-line"]//span[contains(@class, "andes-money-amount")]//span[@class="andes-money-amount__currency-symbol"]').allInnerTexts();
  const costos = await page.locator('//div[contains(@class, "ui-search-item__group__element")]//div[contains(@class, "ui-search-price")]//div[@class = "ui-search-price__second-line"]//span[contains(@class, "andes-money-amount")]//span[@class="andes-money-amount__fraction"]').allInnerTexts();
  
  //Se realiza un método for para que me imprima los primeros 5 elementos de precio y costo en console log.
  for (let i = 0; i < numeroProductos; i++) {
    const titulo = titulos[i];
    const costo = costos[i];
    const moneda = monedas[i];

    console.log('Producto: ', titulo, ' Precio: ', moneda, costo);
  }
});