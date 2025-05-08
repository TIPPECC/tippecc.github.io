## Version 0.4.0 (2025-05-08)

### _Frontend_

__Features:__

- __Related Datasets__: Add a new tab to show related datasets ([#57](https://github.com/TIPPECC/tippecc.github.io/issues/57))
- __Time Filter__: Add a filter to select/filter by time ([#64](https://github.com/TIPPECC/tippecc.github.io/issues/64))
- __Main Categories__: Restructure and extend main categories ([#58]((https://github.com/TIPPECC/tippecc.github.io/issues/58))
- __Dataset List__: Sort prov and related dataset link lists ([#59]((https://github.com/TIPPECC/tippecc.github.io/issues/59)))




__Bugfixes:__

- __Loading Ring__: Fix misplaced after scrolling ([#61](https://github.com/TIPPECC/tippecc.github.io/issues/61))
- __Folder Filter__: Fix filter not applied on start or load from URL ([#67](https://github.com/TIPPECC/tippecc.github.io/issues/67))
- __Time Filter__: Fix filter not applied on start or load from URL ([#66](https://github.com/TIPPECC/tippecc.github.io/issues/66))


### _Backend_
__Features:__
- __Folder Structure__: Add new folder structure and rename LANDSURF to CORDEX_LANDSURF ([#97](https://github.com/geofranzi/geoportal/issues/97))

__Bugfixes:__
- __Server Timeout__: Fix long running processes leads to timeout ([#101](https://github.com/geofranzi/geoportal/issues/101))

### _Data_
- CMIP6 AI 1950 created files do not have a provenance file (ACCESS-ESM1-5 & ACCESS-CM2)
- CMIP6 move all sum/mean periods to new folder location
- CMIP6 AI rename and remove mm
- CMIP6 rename SPI/SPEI files and add w_12; change also in provenance files
- Update provenance graph