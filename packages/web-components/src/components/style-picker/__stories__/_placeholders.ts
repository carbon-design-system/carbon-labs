import * as carbonColors from '@carbon/colors';
import Apple16 from '@carbon/web-components/es/icons/apple/16';
import Corn16 from '@carbon/web-components/es/icons/corn/16';
import Fish16 from '@carbon/web-components/es/icons/fish/16';
import Wheat16 from '@carbon/web-components/es/icons/wheat/16';
import FruitBowl16 from '@carbon/web-components/es/icons/fruit-bowl/16';
import Strawberry16 from '@carbon/web-components/es/icons/strawberry/16';

export const colors = [
  ['Yellow', carbonColors.yellow],
  ['Orange', carbonColors.orange],
  ['Red', carbonColors.red],
  ['Magenta', carbonColors.magenta],
  ['Purple', carbonColors.purple],
  ['Blue', carbonColors.blue],
  ['Cyan', carbonColors.cyan],
  ['Teal', carbonColors.teal],
  ['Green', carbonColors.green],
  ['Cool gray', carbonColors.coolGray],
  ['Gray', carbonColors.gray],
  ['Warm gray', carbonColors.warmGray],
  [
    'Others',
    {
      white: carbonColors.white,
      black: carbonColors.black,
    },
  ],
].map(([label, swatch]) => ({
  label,
  items: Object.entries(swatch).map(([step, color]) => ({
    value: `${label.toLowerCase()}-${step}`,
    label: `${label} ${step}`,
    color,
  })),
}));

export const icons = [
  ['Apple', Apple16],
  ['Corn', Corn16],
  ['Fish', Fish16],
  ['Fruit bowl', FruitBowl16],
  ['Strawberry', Strawberry16],
  ['Wheat', Wheat16],
].map(([label, icon]) => ({
  value: label?.toString().toLowerCase().split(' ').join('-'),
  label,
  renderIcon: icon,
}));

// export const pictograms: StylePickerPictogramModuleProps["items"] = [
//   ['Europe', [
//     ['Amsterdam', AmsterdamWindmill],
//     ['Barcelona', Barcelona],
//     ['Berlin', BerlinBrandenburgGate],
//     ['Budapest', Budapest],
//     ['Copenhagen', CopenhagenSnekkja],
//     ['Dublin', DublinBrewery],
//     ['Hamburg', HamburgPhilharmone],
//     ['London', London],
//     ['Madrid', MadridCathedral],
//     ['Milan', MilanDuomoDiMilano],
//     ['Munich', Munich],
//     ['Nice', Nice],
//     ['Paris', ParisLouvre],
//     ['Prague', PragueCharlesBridgeTower],
//     ['Rome', Rome],
//     ['Stockholm', Stockholm],
//   ]],
//   ['North America', [
//     ['Atlanta', Atlanta],
//     ['Austin', Austin],
//     ['Boston', BostonZakimBridge],
//     ['Chicago', Chicago],
//     ['Mexico City', MexicoCityAngelOfIndependence],
//     ['New York City', NycChryslerBuilding],
//     ['Portland', PortlandBuilding],
//     ['San Francisco', SanFrancisco],
//     ['Seattle', Seattle],
//     ['Toronto', Toronto],
//     ['Vancouver', Vancouver],
//     ['Washington D.C.', WashingtonDc],
//   ]],
//   ['South America', [
//     ['Machu Picchu', PeruMachuPicchu],
//     ['Rio de Janeiro', RioDeJaneiro],
//     ['Sao Paulo', SaoPaulo],
//   ]],
//   ['Asia', [
//     ['Bangalore', Bangalore],
//     ['Beijing', BeijingMunicipal],
//     ['Dubai', DubaiPalmIslands],
//     ['Hong Kong', HongKong],
//     ['Kuala Lumpur', KualaLumpur],
//     ['Moscow', Moscow],
//     ['Seoul', SeoulGyeongbokgungPalace],
//     ['Singapore', Singapore],
//     ['Tel Aviv', TelAviv],
//     ['Tokyo', TokyoGates],
//   ]],
//   ['Africa', [
//     ['Cairo', CairoGizaPlateau],
//   ]],
//   ['Australia', [
//     ['Melbourne', Melbourne],
//   ]],
// ].map(([label, cities]) => ({
//   label,
//   items: cities.map(([name, pictogram]) => ({
//     value: name.toLowerCase().split(' ').join('-'),
//     label: name,
//     renderPictogram: pictogram,
//   })),
// }));
