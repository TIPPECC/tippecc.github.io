export function auto_description(filename, foldertype, metadata) {
    let error = false;
    let variable_name = metadata['file']['long_name'];
    let frequency = metadata['file']['frequency'] + "ly";
    let study_area = "None";
    let bias_correction = false;
    let global_type = "None";
    let global_model = "None";
    let regional_model = "None";
    let period_1 = "None";
    let period_2 = "None";
    let mean = false;
    let description = ""

    if(frequency == "dayly"){
        frequency = "daily"
    }
    if (foldertype.includes("vaal")){
        study_area = "Vaal";
    }
    else if(foldertype.includes("kunene")){
        study_area = "Kunene";
    }
    else if(foldertype.includes("luanginga")){
        study_area = "Luanginga";
    }
    if (filename.includes("_b_")){
        bias_correction = true;
    }
    if (foldertype.includes("CORDEX")){
        global_type = "Cordex-Core";

        if (filename.includes("REMO")){
            regional_model = "GERICS-REMO2015";
        }
        else if (filename.includes("KIT")){
            regional_model = "KIT-CCLM5-0-15"
        }
        else if(filename.includes("ICTP")){
            regional_model = "ICTP-RegCM4-7"
        }
        global_model = metadata['driving_model_id'];
        
    }
    else if(foldertype.includes("CMIP6")){
        global_type = "CMIP6";
        global_model = metadata['source_id'];
    }
    else if(foldertype.includes("ERA5")){
        global_type = "Era5-Land";
    }
    else if(foldertype.includes("GLEAM")){
        global_type = "GLEAM";
    }
    if (filename.includes("yearsum") || filename.includes("yearmean")){
        frequency = "annual aggregated"
        let matchComparison = filename.match(/year(?:sum|mean)_(\d{4})_(\d{4})-(\d{4})_(\d{4})/);
        let matchSingle = filename.match(/year(?:sum|mean)_(\d{4}_\d{4})/);

        if (matchComparison) {
            period_2 = `${matchComparison[1]}–${matchComparison[2]}`;
            period_1 = `${matchComparison[3]}–${matchComparison[4]}`;
        } else if (matchSingle) {
            if (matchSingle) {
                period_1 = `${matchSingle[1]}–${matchSingle[2]}`;
            }
        }
    }
    if (filename.includes("_mean_")){
        mean = true
        let matchComparison = filename.match(/_mean_(\d{4})_(\d{4})-(\d{4})_(\d{4})/);
        let matchSingle = filename.match(/_mean_(\d{4}_\d{4})/);

        if (matchComparison) {
            period_2 = `${matchComparison[1]}–${matchComparison[2]}`;
            period_1 = `${matchComparison[3]}–${matchComparison[4]}`;
        } else if (matchSingle) {
            if (matchSingle) {
                period_1 = `${matchSingle[1]}–${matchSingle[2]}`;
            }
        }
    }
    if (mean){
        description += "mean value of ";
    }
    description += frequency + " data of " + variable_name + " ";
    if (global_type != "None"){
        description += "based on " + global_type + " ";
        if (global_model != "None"){
            description += global_model + " global model ";
        }
        else{
            description += "dataset ";
        }
        if (regional_model != "None"){
            description += "and " + regional_model + " regional model ";
        }
        if (bias_correction){
            description += "with bias correction ";
        }
        if (period_1 != "None"){
            description += "for time period " + period_1 + " ";
        }
        if (period_2 != "None"){
            description += "compared to " + period_2 + " ";
        }
        if (study_area != "None"){
            description += "clipped to " + study_area + " study area ";
        }
    }
    description = format_sentence (description)
    return description
}

function format_sentence(str) {
    if (!str) return "";

    // Trim trailing whitespace
    str = str.trimEnd();

    // Capitalize first letter
    str = str.charAt(0).toUpperCase() + str.slice(1);

    // Add period if not already present
    if (!str.endsWith(".")) {
        str += ".";
    }

    return str;
}