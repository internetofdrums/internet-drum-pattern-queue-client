<template>
  <div
    :class="{ 'overlay-active': overlayActive }"
    class="pattern-maker">
    <div
      @click="hideOverlay()"
      class="overlay">
      <div class="overlay-message">
        {{ overlayMessage }}
      </div>
    </div>

    <form>
      <div class="pattern">
        <div class="row header-row">
          <div class="logo"></div>

          <input
            v-model="name"
            :pattern="validNameRegularExpressionString"
            type="text"
            placeholder="Name"
            required
            maxlength="32"/>

          <button
            @click="submit($event)"
            :disabled="!dataIsValid()"
            type="submit">
            Submit
          </button>

          <button
            @click="reset($event)"
            type="reset">
            Reset
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
  </div>
</template>

<script>
import Vue from 'vue'

const numberOfInstruments = 16
const numberOfInstrumentsToOmmit = 4
const numberOfBarsPerInstrument = 4
const numberOfNotesPerBar = 4
const numberOfDataPartsPerNote = 2
const numberOfBytesInData = numberOfInstruments * numberOfBarsPerInstrument * numberOfNotesPerBar * numberOfDataPartsPerNote
const validNameRegularExpressionString = '^[a-zA-Z0-9 ]+$'
const validNameRegularExpression = RegExp(validNameRegularExpressionString)

let showOverlayTimeout

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

function convertPatternToByteArray (pattern) {
  let ByteArray = new Uint8Array(numberOfBytesInData)
  let i = 0

  pattern.forEach(instrument => {
    instrument.notes.forEach(note => {
      // Note length is always 100%
      ByteArray[i] = (note.on === true ? 0x7F : 0x00)

      // Velocity is always 100%
      ByteArray[i + 1] = (note.on === true ? 0x7F : 0x00)

      i = i + 2
    })
  })

  return ByteArray
}

function convertByteArrayToBase64EncodedString (byteArray) {
  return btoa(String.fromCharCode(...new Uint8Array(byteArray)))
}

async function postPattern (name, encodedPattern) {
  let request = new Request('http://localhost:8080/1.0/patterns/', {
    method: 'POST',
    body: JSON.stringify({
      'name': name,
      'pattern': encodedPattern
    })
  })

  let response

  try {
    response = await fetch(request)
  } catch (error) {
    throw Error('Could not reach the drum pattern queue service :(')
  }

  if (response.status === 201) {
    return
  }

  let json = await response.json()

  if (json && json.message) {
    throw Error(json.message)
  }
}

export default {
  name: 'PatternMaker',
  data: function () {
    return {
      overlayActive: false,
      overlayMessage: '',
      numberOfNotes: numberOfBarsPerInstrument * numberOfNotesPerBar,
      name: '',
      pattern: initPattern(),
      validNameRegularExpressionString: validNameRegularExpressionString
    }
  },
  methods: {
    dataIsValid () {
      return this.name !== '' && validNameRegularExpression.test(this.name)
    },
    showOverlay (message) {
      this.overlayActive = true
      this.overlayMessage = message
    },
    showOverlayTemporarily (message) {
      clearTimeout(showOverlayTimeout)
      this.showOverlay(message)

      showOverlayTimeout = setTimeout(() => {
        this.overlayActive = false
      }, 3000)
    },
    hideOverlay () {
      this.overlayActive = false
    },
    submit: async function (event) {
      event.preventDefault()

      if (!this.dataIsValid()) {
        this.showOverlayTemporarily('Please enter a valid name for your drum pattern :)')
        return
      }

      this.showOverlay('Sending…')

      let byteArray = convertPatternToByteArray(this.pattern)
      let encodedPattern = convertByteArrayToBase64EncodedString(byteArray)

      try {
        await postPattern(this.name, encodedPattern)
        this.showOverlayTemporarily('Your drum pattern was added to the queue :)')
      } catch (error) {
        this.showOverlayTemporarily(error.message)
      }
    },
    reset: function (event) {
      event.preventDefault()

      this.name = ''
      this.pattern.forEach(instrument => {
        instrument.notes.forEach(note => {
          Vue.set(note, 'on', false)
        })
      })
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

  .pattern-maker {
    height: 100%;
  }

  .overlay-active .overlay {
    visibility: visible;
  }

  .overlay {
    align-items: center;
    background: transparentize(#000, 0.8);
    display: flex;
    height: 100vh;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    visibility: hidden;
    width: 100vw;
    z-index: 10;
  }

  .overlay-message {
    align-items: center;
    background: #fff;
    border-radius: 5px;
    box-sizing: border-box;
    display: flex;
    font-size: 1.5rem;
    font-weight: bold;
    justify-content: center;
    margin: 2rem;
    padding: 2rem;
    text-align: center;
  }

  form {
    box-sizing: border-box;
    display: grid;
    height: 100%;
    padding: 3rem;
  }

  input[type=text],
  button {
    border-radius: 5px;
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0;
  }

  input[type=text] {
    background: transparent;
    border: 2px solid #efefef;
    padding: 0.25rem 0.5rem;
  }

  input:invalid {
    color: red;
  }

  button {
    background: #efefef;
    border: 0;
    padding: 0;
  }

  button:hover {
    cursor: pointer;
  }

  button:disabled {
    color: lighten(#000, 67%);
    background: transparent;
  }

  .pattern {
    display: grid;
    grid-row-gap: 5px;
    grid-template-rows: repeat(14, minmax(1rem, 1fr));
    padding: 5px;
  }

  .row {
    display: grid;
    grid-column-gap: 5px;
    grid-template-columns: repeat(17, minmax(1rem, 1fr));
  }

  .header-row {
    grid-template-columns: minmax(1rem, 1fr) minmax(1rem, 12fr) minmax(1rem, 2fr) minmax(1rem, 2fr);
  }

  .cell {
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
  }

  .text-cell {
    align-self: center;
    color: lighten(#000, 50%);
    font-size: 0.75rem;
    text-align: center;
  }

  .instrument .text-cell {
    text-align: right;
  }

  .text-cell:nth-child(2),
  .text-cell:nth-child(6),
  .text-cell:nth-child(10),
  .text-cell:nth-child(14) {
    color: lighten(#000, 33%);
    font-weight: bold;
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
