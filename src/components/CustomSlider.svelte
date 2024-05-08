<script>
    // Define custom slider steps
    export let valMap;
    export let onSliderChangeFunction;
    // const valMap = [0, 1, 3, 5, 10, 15, 20, 30, 50];

    // This is the default position of the slider
    export let sliderValue = 0;

    function onSliderChange(event) {
      // Update the internal slider value based on input change
      sliderValue = event.target.value;
      console.log("DRAG END");
    }
</script>

<style>
    /* Slider styling */
    .slider-container {
      position: relative;
      height: 40px;
    }
  
    .slider {
      width: 100%;
      background: transparent;
      position: relative;
      height: 20px;
    }
  
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: #4caf50;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
    }
  
    .slider-label {
      position: absolute;
      top: -20px;
      transform: translateX(-50%);
    }
  </style>

{#if valMap != undefined}
    <div class="slider-container mt-8">
        <!-- Slider input with custom steps -->
        <input
            type="range"
            class="slider"
            min="0"
            max="{valMap.length - 1}"
            step="1"
            bind:value="{sliderValue}"
            on:change={onSliderChangeFunction}
        />

        <!-- Labels for the slider steps -->
        {#each valMap as val, idx}
            {#if (idx % 10 == 0) || (idx == valMap.length-1)}
                <div
                class="slider-label"
                style="left: { (idx / (valMap.length - 1)) * 100 }%"
                >
                {val}
                </div>
            {/if}
        {/each}
    </div>

    <div class="mt-1">
        Selected Value: {valMap[sliderValue]}
    </div>
{/if}