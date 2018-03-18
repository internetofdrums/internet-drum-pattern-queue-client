<template>
  <form>
    <div class="pattern">
      <div class="row">
        <button
          @click="clear($event)"
          type="reset">
          Clear
        </button>

        <button
          @click="submit($event)"
          type="submit">
          Submit
        </button>
      </div>

      <div class="row">
        <div class="cell text-cell"></div>
        <div
          v-for="index in numberOfNotes"
          :key="index"
          class="cell text-cell">
          {{ index }}
        </div>
      </div>

      <div
        class="row instrument"
        v-for="(instrument, instrumentIndex) in pattern"
        :key="instrument.id">
        <div class="cell text-cell">
          Instrument {{ instrumentIndex + 1 }}
        </div>

        <div
          v-for="(note, noteIndex) in instrument.notes"
          :key="note.id"
          :class="'cell note bar-' + note.bar">
          <input
            v-model="note.on"
            :id="'note-' + instrumentIndex + '-' + noteIndex"
            type="checkbox"/>

          <label
            :for="'note-' + instrumentIndex + '-' + noteIndex">
            <span>Instrument {{ instrumentIndex }}, note {{ noteIndex }}</span>
          </label>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import Vue from 'vue'

const numberOfInstruments = 16
const numberOfInstrumentsToOmmit = 4
const numberOfBarsPerInstrument = 4
const numberOfNotesPerBar = 4
const numberOfDataPartsPerNote = 2

function initPattern () {
  let instruments = []

  for (let i = 0; i < numberOfInstruments - numberOfInstrumentsToOmmit; i++) {
    let notes = []

    for (let j = 0; j < numberOfBarsPerInstrument * numberOfNotesPerBar; j++) {
      notes.push({
        id: i + '.' + j,
        bar: Math.floor(j / numberOfBarsPerInstrument) + 1,
        on: false
      })
    }

    instruments.push({
      id: i,
      notes: notes
    })
  }

  return instruments
}

export default {
  name: 'PatternMaker',
  data: function () {
    return {
      numberOfNotes: numberOfBarsPerInstrument * numberOfNotesPerBar,
      pattern: initPattern()
    }
  },
  methods: {
    clear: function (event) {
      event.preventDefault()

      this.pattern.forEach(instrument => {
        instrument.notes.forEach(note => {
          Vue.set(note, 'on', false)
        })
      })
    },
    submit: async function (event) {
      event.preventDefault()

      console.log(this.pattern)

      let numberOfBytesInData = numberOfInstruments * numberOfBarsPerInstrument * numberOfNotesPerBar * numberOfDataPartsPerNote
      let data = new Uint8Array(numberOfBytesInData)
      let i = 0

      this.pattern.forEach(instrument => {
        instrument.notes.forEach(note => {
          data[i] = (note.on === true ? 0x7F : 0x00) // Note length is always 100%
          data[i + 1] = (note.on === true ? 0x7F : 0x00) // Velocity is always 100%
          i = i + 2
        })
      })

      console.log(data)

      let encodedData = btoa(String.fromCharCode(...new Uint8Array(data)))

      console.log(encodedData)

      let request = new Request('http://localhost:8080/1.0/patterns/', {
        method: 'POST',
        body: JSON.stringify({
          'name': 'Piet',
          'pattern': encodedData
        })
      })

      try {
        return await fetch(request)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss">
  @keyframes circle-grow {
    from {
      clip-path: circle(0% at 50% 50%);
    }

    to {
      clip-path: circle(100% at 50% 50%);
    }
  }

  form {
    display: grid;
    height: 100%;
  }

  .pattern {
    display: grid;
    grid-row-gap: 5px;
    grid-template-rows: repeat(14, 1fr);
    padding: 5px;
  }

  .row {
    display: grid;
    grid-column-gap: 5px;
    grid-template-columns: repeat(17, minmax(1rem, 1fr));
  }

  .cell {
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
  }

  .text-cell {
    align-self: center;
    text-align: center;
  }

  .note input {
    visibility: hidden;
  }

  .note label {
    background: #efefef;
    border-radius: 5px;
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .note label:hover {
    cursor: pointer;
  }

  .note label:after {
    background: #243bf3;
    border-radius: 5px;
    clip-path: circle(0 at 50% 50%);
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .bar-2 label:after {
    background: #705ff2;
  }

  .bar-3 label:after {
    background: #a379f0;
  }

  .bar-4 label:after {
    background: #c994f0;
  }

  .note input:not(:checked) + label:hover::after {
    clip-path: none;
    opacity: 0.2;
  }

  .note input:checked + label:after {
    animation: 0.25s circle-grow;
    clip-path: circle(100% at 50% 50%);
  }

  .note label span {
    visibility: hidden;
  }
</style>
