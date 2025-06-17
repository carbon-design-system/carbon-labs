/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as carbonColors from '@carbon/colors';
import Apple16 from '@carbon/web-components/es/icons/apple/16';
import Corn16 from '@carbon/web-components/es/icons/corn/16';
import Fish16 from '@carbon/web-components/es/icons/fish/16';
import Wheat16 from '@carbon/web-components/es/icons/wheat/16';
import FruitBowl16 from '@carbon/web-components/es/icons/fruit-bowl/16';
import Strawberry16 from '@carbon/web-components/es/icons/strawberry/16';
import AmsterdamWindmill from '@carbon/pictograms/es/amsterdam--windmill';
import Barcelona from '@carbon/pictograms/es/barcelona';
import BerlinBrandenburgGate from '@carbon/pictograms/es/berlin--brandenburg-gate';
import Bangalore from '@carbon/pictograms/es/bangalore';
import Budapest from '@carbon/pictograms/es/budapest';
import CopenhagenSnekkja from '@carbon/pictograms/es/copenhagen--snekkja';
import DublinBrewery from '@carbon/pictograms/es/dublin--brewery';
import HamburgPhilharmone from '@carbon/pictograms/es/hamburg--philharmone';
import London from '@carbon/pictograms/es/london';
import MadridCathedral from '@carbon/pictograms/es/madrid--cathedral';
import MilanDuomoDiMilano from '@carbon/pictograms/es/milan--duomo-di-milano';
import Munich from '@carbon/pictograms/es/munich';
import Nice from '@carbon/pictograms/es/nice';
import ParisEiffelTower from '@carbon/pictograms/es/paris--eiffel-tower';
import PragueCharlesBridgeTower from '@carbon/pictograms/es/prague--charles-bridge-tower';
import Rome from '@carbon/pictograms/es/rome';
import Stockholm from '@carbon/pictograms/es/stockholm';
import Atlanta from '@carbon/pictograms/es/atlanta';
import Austin from '@carbon/pictograms/es/austin';
import BostonZakimBridge from '@carbon/pictograms/es/boston--zakim-bridge';
import Chicago from '@carbon/pictograms/es/chicago';
import MexicoCityAngelOfIndependence from '@carbon/pictograms/es/mexico-city--angel-of-independence';
import NycChryslerBuilding from '@carbon/pictograms/es/nyc--chrysler-building';
import PortlandBuilding from '@carbon/pictograms/es/portland--building';
import SanFrancisco from '@carbon/pictograms/es/san-francisco';
import Seattle from '@carbon/pictograms/es/seattle';
import Toronto from '@carbon/pictograms/es/toronto';
import Vancouver from '@carbon/pictograms/es/vancouver';
import WashingtonDc from '@carbon/pictograms/es/washington-dc';
import PeruMachuPicchu from '@carbon/pictograms/es/peru--machu-picchu';
import RioDeJaneiro from '@carbon/pictograms/es/rio-de-janeiro';
import SaoPaulo from '@carbon/pictograms/es/sao-paulo';
import BeijingMunicipal from '@carbon/pictograms/es/beijing--municipal';
import DubaiPalmIslands from '@carbon/pictograms/es/dubai--palm-islands';
import HongKong from '@carbon/pictograms/es/hong-kong';
import KualaLumpur from '@carbon/pictograms/es/kuala-lumpur';
import Moscow from '@carbon/pictograms/es/moscow';
import SeoulGyeongbokgungPalace from '@carbon/pictograms/es/seoul--gyeongbokgung-palace';
import Singapore from '@carbon/pictograms/es/singapore';
import TelAviv from '@carbon/pictograms/es/tel-aviv';
import TokyoGates from '@carbon/pictograms/es/tokyo--gates';
import CairoGizaPlateau from '@carbon/pictograms/es/cairo--giza-plateau';
import Melbourne from '@carbon/pictograms/es/melbourne';
import { Group, Item } from '../defs/style-picker-module.types';

type ColorItem = {
  color: string;
};

export const colors: Group<Item<ColorItem>>[] = [
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
  items: Object.entries(swatch as Record<string, string>).map(
    ([step, color]) => ({
      value: `${label.toLowerCase()}-${step}`,
      label: `${label} ${step}`,
      color,
    })
  ),
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

export const pictograms = [
  [
    'Europe',
    [
      ['Amsterdam', AmsterdamWindmill],
      ['Barcelona', Barcelona],
      ['Berlin', BerlinBrandenburgGate],
      ['Budapest', Budapest],
      ['Copenhagen', CopenhagenSnekkja],
      ['Dublin', DublinBrewery],
      ['Hamburg', HamburgPhilharmone],
      ['London', London],
      ['Madrid', MadridCathedral],
      ['Milan', MilanDuomoDiMilano],
      ['Munich', Munich],
      ['Nice', Nice],
      ['Paris', ParisEiffelTower],
      ['Prague', PragueCharlesBridgeTower],
      ['Rome', Rome],
      ['Stockholm', Stockholm],
    ],
  ],
  [
    'North America',
    [
      ['Atlanta', Atlanta],
      ['Austin', Austin],
      ['Boston', BostonZakimBridge],
      ['Chicago', Chicago],
      ['Mexico City', MexicoCityAngelOfIndependence],
      ['New York City', NycChryslerBuilding],
      ['Portland', PortlandBuilding],
      ['San Francisco', SanFrancisco],
      ['Seattle', Seattle],
      ['Toronto', Toronto],
      ['Vancouver', Vancouver],
      ['Washington D.C.', WashingtonDc],
    ],
  ],
  [
    'South America',
    [
      ['Machu Picchu', PeruMachuPicchu],
      ['Rio de Janeiro', RioDeJaneiro],
      ['Sao Paulo', SaoPaulo],
    ],
  ],
  [
    'Asia',
    [
      ['Bangalore', Bangalore],
      ['Beijing', BeijingMunicipal],
      ['Dubai', DubaiPalmIslands],
      ['Hong Kong', HongKong],
      ['Kuala Lumpur', KualaLumpur],
      ['Moscow', Moscow],
      ['Seoul', SeoulGyeongbokgungPalace],
      ['Singapore', Singapore],
      ['Tel Aviv', TelAviv],
      ['Tokyo', TokyoGates],
    ],
  ],
  ['Africa', [['Cairo', CairoGizaPlateau]]],
  ['Australia', [['Melbourne', Melbourne]]],
].map(([label, cities]) => ({
  label,
  items: (cities as Array<any>).map(([name, pictogram]) => ({
    value: name.toLowerCase().split(' ').join('-'),
    label: name,
    renderPictogram: pictogram,
  })),
}));
