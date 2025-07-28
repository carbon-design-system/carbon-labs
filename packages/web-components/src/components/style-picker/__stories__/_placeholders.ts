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
import AmsterdamWindmill from '@carbon/pictograms/lib/amsterdam--windmill';
import Barcelona from '@carbon/pictograms/lib/barcelona';
import BerlinBrandenburgGate from '@carbon/pictograms/lib/berlin--brandenburg-gate';
import Bangalore from '@carbon/pictograms/lib/bangalore';
import Budapest from '@carbon/pictograms/lib/budapest';
import CopenhagenSnekkja from '@carbon/pictograms/lib/copenhagen--snekkja';
import DublinBrewery from '@carbon/pictograms/lib/dublin--brewery';
import HamburgPhilharmone from '@carbon/pictograms/lib/hamburg--philharmone';
import London from '@carbon/pictograms/lib/london';
import MadridCathedral from '@carbon/pictograms/lib/madrid--cathedral';
import MilanDuomoDiMilano from '@carbon/pictograms/lib/milan--duomo-di-milano';
import Munich from '@carbon/pictograms/lib/munich';
import Nice from '@carbon/pictograms/lib/nice';
import ParisEiffelTower from '@carbon/pictograms/lib/paris--eiffel-tower';
import PragueCharlesBridgeTower from '@carbon/pictograms/lib/prague--charles-bridge-tower';
import Rome from '@carbon/pictograms/lib/rome';
import Stockholm from '@carbon/pictograms/lib/stockholm';
import Atlanta from '@carbon/pictograms/lib/atlanta';
import Austin from '@carbon/pictograms/lib/austin';
import BostonZakimBridge from '@carbon/pictograms/lib/boston--zakim-bridge';
import Chicago from '@carbon/pictograms/lib/chicago';
import MexicoCityAngelOfIndependence from '@carbon/pictograms/lib/mexico-city--angel-of-independence';
import NycChryslerBuilding from '@carbon/pictograms/lib/nyc--chrysler-building';
import PortlandBuilding from '@carbon/pictograms/lib/portland--building';
import SanFrancisco from '@carbon/pictograms/lib/san-francisco';
import Seattle from '@carbon/pictograms/lib/seattle';
import Toronto from '@carbon/pictograms/lib/toronto';
import Vancouver from '@carbon/pictograms/lib/vancouver';
import WashingtonDc from '@carbon/pictograms/lib/washington-dc';
import PeruMachuPicchu from '@carbon/pictograms/lib/peru--machu-picchu';
import RioDeJaneiro from '@carbon/pictograms/lib/rio-de-janeiro';
import SaoPaulo from '@carbon/pictograms/lib/sao-paulo';
import BeijingMunicipal from '@carbon/pictograms/lib/beijing--municipal';
import DubaiPalmIslands from '@carbon/pictograms/lib/dubai--palm-islands';
import HongKong from '@carbon/pictograms/lib/hong-kong';
import KualaLumpur from '@carbon/pictograms/lib/kuala-lumpur';
import Moscow from '@carbon/pictograms/lib/moscow';
import SeoulGyeongbokgungPalace from '@carbon/pictograms/lib/seoul--gyeongbokgung-palace';
import Singapore from '@carbon/pictograms/lib/singapore';
import TelAviv from '@carbon/pictograms/lib/tel-aviv';
import TokyoGates from '@carbon/pictograms/lib/tokyo--gates';
import CairoGizaPlateau from '@carbon/pictograms/lib/cairo--giza-plateau';
import Melbourne from '@carbon/pictograms/lib/melbourne';
import { Group, Item } from '../defs/style-picker-group.types';
import { SVGTemplateResult } from 'lit';

type ColorItem = {
  color: string;
};

type IconItem = {
  renderIcon: string | ((args?: any) => SVGTemplateResult);
};

type PictogramItem = {
  pictogram: SVGTemplateResult;
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

export const icons: Item<IconItem>[] = [
  ['Apple', Apple16],
  ['Corn', Corn16],
  ['Fish', Fish16],
  ['Fruit bowl', FruitBowl16],
  ['Strawberry', Strawberry16],
  ['Wheat', Wheat16],
].map(([label, icon]) => ({
  value: label?.toString().toLowerCase().split(' ').join('-'),
  label: label as string,
  renderIcon: icon,
}));

export const pictograms: Group<Item<PictogramItem>>[] = [
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
  label: label as string,
  items: (cities as Array<any>).map(([name, pictogram]) => ({
    value: name.toLowerCase().split(' ').join('-'),
    label: name,
    pictogram,
  })),
}));
