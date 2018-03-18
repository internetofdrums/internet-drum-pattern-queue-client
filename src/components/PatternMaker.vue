<template>
  <form>
    <div class="pattern">
      <div
        class="instrument"
        v-for="(instrument, instrumentIndex) in pattern"
        :key="instrumentIndex">
        <div
          v-for="(note, noteIndex) in instrument.notes"
          :key="noteIndex"
          v-bind:class="'note bar-' + note.bar">
          <input
            v-model="note.on"
            type="checkbox"
            v-bind:id="'note-' + instrumentIndex + '-' + noteIndex"/>

          <label
            v-bind:for="'note-' + instrumentIndex + '-' + noteIndex">
            <span>Instrument {{ instrumentIndex }}, note {{ noteIndex }}</span>
          </label>
        </div>
      </div>
    </div>

    <button
      v-on:click="addToQueue($event)"
      type="submit">
      Submit
    </button>
  </form>
</template>

<script>
const numberOfInstruments = 16
const numberOfInstrumentsToOmmit = 4
const numberOfBarsPerInstrument = 4
const numberOfNotesPerBar = 4
const numberOfDataPartsPerNote = 2

export default {
  name: 'PatternMaker',
  computed: {
    pattern: function () {
      let instruments = []

      for (let i = 0; i < numberOfInstruments - numberOfInstrumentsToOmmit; i++) {
        let notes = []

        for (let j = 0; j < numberOfBarsPerInstrument * numberOfNotesPerBar; j++) {
          notes.push({
            bar: Math.floor(j / numberOfBarsPerInstrument) + 1,
            on: false
          })
        }

        instruments.push({
          notes: notes
        })
      }

      return instruments
    }
  },
  methods: {
    addToQueue: async function (event) {
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
