<script>
    export let activeView; // Receive the writable store
    import { isSwitchOn } from "$lib/store"; // Import the store

    const switchView = (view) => {
        activeView.set(view); // Update the store directly
        console.log("Switched to:", view);
    };
</script>

<div class="top-bar">
    <button class="top-bar-button" 
            on:click={() => switchView("View 1")}
            class:active={$activeView === "View 1"}>
        Minimal View
    </button>
    <button class="top-bar-button" 
            on:click={() => switchView("View 2")}
            class:active={$activeView === "View 2"}>
        Detail View
    </button>
    <button class="top-bar-button" 
            on:click={() => switchView("View 3")}
            class:active={$activeView === "View 3"}>
        Collection View
    </button>

    <!-- Spacer to push the switch to the right -->
    <div class="spacer"></div>

    <div class="custom-switch">
        <label class="switch">
          <input type="checkbox" bind:checked={$isSwitchOn} />
          <span class="slider">
            <span class="label">{$isSwitchOn ? 'PROV-ON' : 'PROV-OFF'}</span>
          </span>
        </label>
      </div>
</div>

<style>
    .top-bar {
        display: flex;
        justify-content: flex-start; /* Align items to the left */
        align-items: center; /* Vertically center items */
        background-color: #f8f9fa; /* Light gray background */
        padding: 10px;
        border-bottom: 2px solid #ddd; /* Optional bottom border */
        gap: 10px; /* Space between buttons */
        z-index: 10;
    }

    .spacer {
      flex-grow: 0.5; /* Push everything after it to the far right */
    }

    .top-bar-button {
        padding: 10px 20px;
        font-size: 16px;
        background-color: rgb(194, 194, 194);
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer !important;;
        transition: background-color 0.2s, color 0.2s;
        color: black;
        pointer-events: auto;
        z-index: 20;
    }

    .top-bar-button:hover {
        background-color: #203c74;
        color: white;
        cursor: pointer !important;
    }

    .top-bar-button.active {
        background-color: #203c74 !important; /* Keep the active button blue */
        color: white;
    }


    .custom-switch {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 30px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: background-color 0.4s, box-shadow 0.4s;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .slider:before {
    content: '';
    position: absolute;
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input:checked + .slider {
    background-color: #203c74; /* Tailwind green-500 for ON */
    box-shadow: 0 0 10px #203c74;
  }

  input:checked + .slider:before {
    transform: translateX(66px); /* Moves all the way to the right (100px slider - 22px handle - 4px padding) */
  }

  .label {
    position: absolute;
    font-size: 12px;
    font-weight: bold;
    color: white;
    user-select: none;
  }

  input:checked + .slider .label {
    transform: translateX(-10px);
  }

  .slider .label {
    transform: translateX(10px);
  }
</style>
