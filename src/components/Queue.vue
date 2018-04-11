<template>
  <div class="queue">
    <div class="head">
      <h1>Now playing: <strong>{{ head.name }}</strong></h1>

      <div class="pattern">
        <div
          :class="{ 'on': note.on }"
          class="note"
          v-for="note in head.pattern"
          :key="note.id">
        </div>
      </div>
    </div>

    <div class="tail">
      <h1>Up next:</h1>

      <div
        class="item"
        v-for="pattern in tail"
        :key="pattern.id">
        <h2>{{ pattern.name }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
async function fetchQueue () {
  let request = new Request(process.env.API_URL + '/patterns')

  let response

  try {
    response = await fetch(request)
  } catch (error) {
    throw Error('Could not reach the drum pattern queue service :(')
  }

  let json = await response.json()

  if (json && json.message) {
    throw Error(json.message)
  }

  return json
}

async function fetchHead () {
  let request = new Request(process.env.API_URL + '/patterns/head')

  let response

  try {
    response = await fetch(request)
  } catch (error) {
    throw Error('Could not reach the drum pattern queue service :(')
  }

  let json = await response.json()

  if (json && json.message) {
    throw Error(json.message)
  }

  return json
}

export default {
  name: 'Queue',
  data: function () {
    return {
      head: {},
      tail: []
    }
  },
  methods: {
    async refreshQueue () {
      try {
        let queue = await fetchQueue()
        queue.shift()
        this.tail = queue
      } catch (error) {
        console.log(error)
      }

      try {
        let head = await fetchHead()
        let patternData = atob(head.pattern)
        let pattern = []

        for (let i = 0; i < patternData.length; i++) {
          let value = patternData[i].charCodeAt(0)
          pattern.push({
            id: i,
            on: value > 0
          })
        }

        this.head = {
          name: head.name,
          pattern: pattern
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
  mounted: function () {
    this.refreshQueue()

    setInterval(this.refreshQueue, 2000)
  }
}
</script>

<style lang="scss">
  $black: #414042;
  $white: #fff;
  $grey: lighten($black, 65%);
  $grey-lighter: lighten($black, 70%);
  $orange: #ff9a1f;
  $brown: #59a975;
  $green: #1fb6b1;
  $blue: #354d6a;

  h1,
  h2 {
    color: lighten($black, 33%);
    font-weight: bold;

    strong {
      color: $black;
    }
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  em {
    font-style: italic;
  }

  .queue {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .head,
  .tail {
    padding: 1rem;
  }

  .head {
    flex: 3;
    flex-basis: auto;
    order: 1;
    overflow: hidden;
  }

  .tail {
    flex: 1;
    order: 1;
  }

  .item {
    background: $grey-lighter;
    border-radius: 5px;
    margin-bottom: 1rem;
    padding: 1rem;

    h2 {
      color: $black;
    }
  }

  .pattern {
    display: grid;
    grid-gap: 5px;
    grid-template-rows: repeat(12, minmax(1rem, 1fr));
    grid-template-columns: repeat(16, minmax(1rem, 1fr));
    height: 90%;
  }

  .note {
    background: $grey-lighter;
    border-radius: 5px;

    &.on {
      background: $orange;
    }

    &:nth-child(5),
    &:nth-child(6),
    &:nth-child(7),
    &:nth-child(8) {
      &.on {
        background: $brown;
      }
    }

    &:nth-child(9),
    &:nth-child(10),
    &:nth-child(11),
    &:nth-child(12) {
      &.on {
        background: $green;
      }
    }

    &:nth-child(13),
    &:nth-child(14),
    &:nth-child(15),
    &:nth-child(16) {
      &.on {
        background: $blue;
      }
    }
  }
</style>
