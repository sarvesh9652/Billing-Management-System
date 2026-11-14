import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-A7325IXO.js";
import {
  MatOptgroup,
  MatOption
} from "./chunk-5VQVYDV4.js";
import "./chunk-GXSVNMED.js";
import "./chunk-MSEAH6KB.js";
import "./chunk-MHWQCDN4.js";
import "./chunk-IJAGR3PN.js";
import "./chunk-C6FZZ6QN.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-XV356W2I.js";
import "./chunk-4A5J2HAW.js";
import "./chunk-P7Y4YWRO.js";
import "./chunk-AW5NCYZM.js";
import "./chunk-DABFMKCA.js";
import "./chunk-GWFLKVBH.js";
import "./chunk-JUUXEMF2.js";
import "./chunk-2KNWLPG2.js";
import "./chunk-L6JUMDLV.js";
import "./chunk-QAHCXLAE.js";
import "./chunk-5EG33CFQ.js";
import "./chunk-OPBK7WST.js";
import "./chunk-7HNVYIUF.js";
import "./chunk-4UIN5WAH.js";
import "./chunk-5ASLREJG.js";
import "./chunk-M4PLGZ2Q.js";
import "./chunk-D2PUDICK.js";
import "./chunk-GP4CBBHL.js";
import "./chunk-EFGXYNOZ.js";
import "./chunk-I6DCS273.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [
      {
        type: 0,
        name: "void",
        styles: {
          type: 6,
          styles: { opacity: 0, transform: "scale(1, 0.8)" },
          offset: null
        }
      },
      {
        type: 1,
        expr: "void => showing",
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: { opacity: 1, transform: "scale(1, 1)" },
            offset: null
          },
          timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
        },
        options: null
      },
      {
        type: 1,
        expr: "* => void",
        animation: {
          type: 4,
          styles: { type: 6, styles: { opacity: 0 }, offset: null },
          timings: "100ms linear"
        },
        options: null
      }
    ],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
