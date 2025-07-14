<script lang="ts">
    export let step: number = 1;
    export let activeRanges: { start: number; end: number }[] = [{ start: 1950, end: 2010 }];
    

    // Define the fixed range for the entire timeline
    const fixedBeginYear = 1800;
    const fixedEndYear = 2100;

    let years: number[] = [];
    $: {
        // Generate years from fixed range (1900 to 2100) based on the given step
        years = [];
        for (let year = fixedBeginYear; year <= fixedEndYear; year += step) {
            years.push(year);
        }
    }

    // Calculate filled sections based on active ranges
    let filledSections: { startPosition: number; width: number; startYear: number; endYear: number }[] = [];
    $: {
        filledSections = activeRanges.map(range => {
            const totalRange = fixedEndYear - fixedBeginYear;
            const startRelative = Math.max(range.start, fixedBeginYear);
            const endRelative = Math.min(range.end, fixedEndYear);

            // Ensure the range is valid
            if (startRelative >= endRelative || startRelative < fixedBeginYear || endRelative > fixedEndYear) {
                return { startPosition: 0, width: 0, startYear: 0, endYear: 0 }; // Invalid range returns 0
            }

            const startPosition = ((startRelative - fixedBeginYear) / totalRange) * 100;
            const width = ((endRelative - startRelative) / totalRange) * 100;
            return { startPosition, width, startYear: startRelative, endYear: endRelative };
        });
    }
</script>

<style>
    .timeline-container {
        margin-top: -20px;
        margin-bottom: -10px;
        display: flex;
        align-items: center;
        position: relative;
        height: 40px;
        width: 100%;
    }

    .filled-section {
        position: absolute;
        top: 0;
        height: 100%;
        background-color: #424242;
        border-radius: 10px;
    }

    .filled-section-label {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        color: #424242; 
        white-space: nowrap;
        font-weight: bold;
    }

    .timeline {
        height: 7px;
        width: 100%;
        background-color: #EAF6EA;
        position: relative;
        top: 2px;
        border-radius: 25px;
    }
</style>

<div class="timeline-container">
    <div class="timeline">
        {#each years as year, i}
            <!-- Optional: Add tick marks if needed -->
            <!-- <div class="tick" style="left: {(i / (years.length - 1)) * 100}%"></div> -->
        {/each}

        {#each filledSections as section}
            <div
                class="filled-section"
                style="left: {section.startPosition}%; width: {section.width}%"
            >
                <span class="filled-section-label" style="margin-top: -8px;">{section.startYear}-{section.endYear}</span>
            </div>
        {/each}
    </div>
</div>
