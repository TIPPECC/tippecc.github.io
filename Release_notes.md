## Version 1.1 (2025-01-10)

#### _Frontend_

**Features** 

- **Download by Extent**: Add interface for download clipped by time and bounding box ([#116](https://github.com/TIPPECC/tippecc.github.io/issues/116))
- **Map**: Additional IPCC colors (sequential) and compare mode ([#94](https://github.com/TIPPECC/tippecc.github.io/issues/94))
- **Light mode**: Add in addition to dark mode ([#96](https://github.com/TIPPECC/tippecc.github.io/issues/96), [#98](https://github.com/TIPPECC/tippecc.github.io/issues/98))
- **Accessibility**: Improve and remove errors ([#121](https://github.com/TIPPECC/tippecc.github.io/issues/121))

**Enhancements:**

- **Loading**: Add loading spinner over full page ([#125](https://github.com/TIPPECC/tippecc.github.io/issues/125))
- **Mobile version**: improvements and fixes ([#93](https://github.com/TIPPECC/tippecc.github.io/issues/93))([#128](https://github.com/TIPPECC/tippecc.github.io/issues/128))
- **Metadata**: Add missing cell method ([#91](https://github.com/TIPPECC/tippecc.github.io/issues/91))
- **Collection Page**: UI improvements ([#90](https://github.com/TIPPECC/tippecc.github.io/issues/90))
- **Collection Page**: Move select/unselect all to the bottom ([#103](https://github.com/TIPPECC/tippecc.github.io/issues/103))
- **Filter**: Add names to periods and missing periods ([#102](https://github.com/TIPPECC/tippecc.github.io/issues/102))([#127](https://github.com/TIPPECC/tippecc.github.io/issues/127))
- **Map**: Exchange basemap with a topo map ([#101](https://github.com/TIPPECC/tippecc.github.io/issues/101))
- **Map & Chart**: Legend improvements ([#103](https://github.com/TIPPECC/tippecc.github.io/issues/103), [#124](https://github.com/TIPPECC/tippecc.github.io/issues/124))


**Bugfixes:**

- **Download by extent**: Find a way to round numbers in Javascript ([#117](https://github.com/TIPPECC/tippecc.github.io/issues/117))
- **Mobile view**: Conditionally display Mobile FileDetails ([#112](https://github.com/TIPPECC/tippecc.github.io/issues/112))
- **Collection Page**: Tiff button sometimes too big ([#111](https://github.com/TIPPECC/tippecc.github.io/issues/111))
- **Map**: OpenLayers CSS missing ([#92](https://github.com/TIPPECC/tippecc.github.io/issues/92))
- **Deatil Pages**: Layout broken ([#105](https://github.com/TIPPECC/tippecc.github.io/issues/105))
- **Filter**: Aggregation value not reset on collection change ([#122](https://github.com/TIPPECC/tippecc.github.io/issues/122))
- **Deep links break layout**: Scroll to open file shrinks the header ([#118](https://github.com/TIPPECC/tippecc.github.io/issues/118))
- *AMap Legend**: Colorbar resizing fails due to wrong ids ([#123](https://github.com/TIPPECC/tippecc.github.io/issues/123))


### _Backend_

**Download by Extent**: Add API for spatial clipping and temporal slicing  ([#112](https://github.com/geofranzi/geoportal/issues/112))

### _Data_
- changed SPI / SPEI calculations (remove reference period to reduce boundary hits )
- refactoring calculation functions to work with Dask to deal with bigger datasets
- CC-BY-4.0 added for our datasets
**Known issues** 
- metadata / units incorrect for SPi / SPEI
- provenance gaps in CORDEX-CORE data
- hurs in CORDEX_CORE raw with gaps in ICTP
- CORDEX-CORE bias adjusted precipitation: continent edge pixel with too much null values 
- newly add periods and absolute changes missing for most datasets
- random missing files during periods calculation
- missing citation
- metadata in netCDF files not corrected
- years for some CORDEX-CORE products not correct
- provenance info not in netCDF
- yearly sum for radiation seems too big in some files in CMIP6 e.g., TIPPECC_HadGEM3-GC31-MM_day_r1i1p1f3_rlus_1850_2100__yearly_total_j.nc
- LANDSURF data: DOI not in netCDF
- CMIP6 bias adjusted missing
- high resolution data missing





## Version 1.0.0beta (2025-05-16)

### _Frontend_

**Features:**

- **Collection Page**: Restructure header part ([#81](https://github.com/TIPPECC/tippecc.github.io/issues/81))
- **Landing Page File**: Add a new landing page for single files ([#62](https://github.com/TIPPECC/tippecc.github.io/issues/62))
- **Start Page**: Add a temporary start page ([#80](https://github.com/TIPPECC/tippecc.github.io/issues/80))
- **Bugfixes:**
- **Chart Legend**: Fix legend and trend not showing for some charts ([#79](https://github.com/TIPPECC/tippecc.github.io/issues/79))

### _Backend_

**Bugfixes:**

- **Team Page Error**: Fix team page error ([#107](https://github.com/geofranzi/geoportal/issues/107))
- **Docker Container**: Fix docker container run out of memory ([#108](https://github.com/geofranzi/geoportal/issues/108))

### _Data_

- **Aridity Index**: Rerun based on new files name
- **SUM/MEAN Periods**: Do and redo for all variables and indicators (fix seasonal and monthly sum was total and not mean & sum one time too much converted to mm yr-1)
- **Cleanup**: Remove old files do not fit to the current file name structure
- **Yearly**: Add yearly files for all variables and indicators (CORDEX, CORDEX bias, CMIP6)
- **Precipitation**: Add converted mm to CORDEX, CORDEX bias, and CMIP6 per default
- **Provenance Graph**: Update provenance graph
- **Known Issues**:
  - some SPI / SPEI / KBDI missing (reasons mainly calendar issues)
  - some units may not correctly set (e.g., mm y-1 for monthly precipitation)
  - metadata not written back to nc files (e.g., corrected resolution, units, etc.)
  - "cite as" not provided in metadata for all files (not yet decided and implemented in the backend)
  - high resolution climate projections not yet available
  - CMIP6 bias correction not yet available
  - Provenance for CORDEX incomplete (no source scenario files information available)

## Version 0.5.0 (2025-05-11)

### _Frontend_

**Features:**

- **Public Collection Page**: Add a new public collection page ([#63](https://github.com/TIPPECC/tippecc.github.io/issues/63))
- **Map View**: Add units ([#73](https://github.com/TIPPECC/tippecc.github.io/issues/73))
- **Map View Scale**: Forced gray rescale under specific conditions ([#68](https://github.com/TIPPECC/tippecc.github.io/issues/68))
- **Map View Chart**: Show months for monthly data and seasons for seasonal data ([#65](https://github.com/TIPPECC/tippecc.github.io/issues/65))
- **Load File**: Add scroll to file when loading via URL ([#72](<[https://gi](https://github.com/TIPPECC/tippecc.github.io/issues/72)>))
- **Collection View**: Add filter by monthly, seasonal, and annual data ([64](<[https://gi](https://github.com/TIPPECC/tippecc.github.io/issues/64)>))

**Bugfixes:**

- **Collection View**: Prevent excessive DOM manipulation on water_budget page ([#69](https://github.com/TIPPECC/tippecc.github.io/issues/69))
- **Select All Files**: Fix select all files selects invisible as well ([#70](https://github.com/TIPPECC/tippecc.github.io/issues/70))
- **Map View Chart**: Times are not decoded correctly ([#76](https://github.com/TIPPECC/tippecc.github.io/issues/76))

### _Backend_

**Features:**
Add CORDEX & CMIP stats folder ([#75](https://github.com/TIPPECC/tippecc.github.io/issues/75))

**Bugfixes:** -**Exception Handling**: Fix exception handling in the backend ([#104](https://github.com/geofranzi/geoportal/issues/101))

### _Data_

- correct climatology boundaries not set correctly (end: YYYY-01-01 instead of YYYY-12-31)
- fix error YYYY-12-31 does not exists in 360day calenders
- correct PET / water budget units
- new file name structure for periods sum/means
- calculate sum/mean periods for all variables (CORDEX / CORDEX bias & CMIP - 70% done)
- correct units for sum variables files (pr -> mm yr-1, radiation -> J m-2)
- add license information to extracted metadata files
- add provenance information to CORDEX raw & bias files (without scenario)
- add missing provenance to slice time aridity index (1850 -> 1950)
- integrate update in provenance graph creation (include functions)

## Version 0.4.0 (2025-05-08)

### _Frontend_

**Features:**

- **Related Datasets**: Add a new tab to show related datasets ([#57](https://github.com/TIPPECC/tippecc.github.io/issues/57))
- **Time Filter**: Add a filter to select/filter by time ([#64](https://github.com/TIPPECC/tippecc.github.io/issues/64))
- **Main Categories**: Restructure and extend main categories ([#58](<(https://github.com/TIPPECC/tippecc.github.io/issues/58)>)
- **Dataset List**: Sort prov and related dataset link lists ([#59](<(https://github.com/TIPPECC/tippecc.github.io/issues/59)>))

**Bugfixes:**

- **Loading Ring**: Fix misplaced after scrolling ([#61](https://github.com/TIPPECC/tippecc.github.io/issues/61))
- **Folder Filter**: Fix filter not applied on start or load from URL ([#67](https://github.com/TIPPECC/tippecc.github.io/issues/67))
- **Time Filter**: Fix filter not applied on start or load from URL ([#66](https://github.com/TIPPECC/tippecc.github.io/issues/66))

### _Backend_

**Features:**

- **Folder Structure**: Add new folder structure and rename LANDSURF to CORDEX_LANDSURF ([#97](https://github.com/geofranzi/geoportal/issues/97))

**Bugfixes:**

- **Server Timeout**: Fix long running processes leads to timeout ([#101](https://github.com/geofranzi/geoportal/issues/101))

### _Data_

- CMIP6 AI 1950 created files do not have a provenance file (ACCESS-ESM1-5 & ACCESS-CM2)
- CMIP6 move all sum/mean periods to new folder location
- CMIP6 AI rename and remove mm
- CMIP6 rename SPI/SPEI files and add w_12; change also in provenance files
- Update provenance graph
