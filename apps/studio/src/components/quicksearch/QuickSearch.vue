<template>
  <div
    class="quicksearch"
    v-hotkey="keymap"
  >
    <div class="quicksearch-bg" />
    <div
      class="quicksearch-wrap"
      ref="menu"
    >
      <div class="form-group">
        <input
          type="text"
          ref="searchBox"
          placeholder="Quick Search"
          v-model="searchTerm"
        >
        <span
          class="clear"
          @click.prevent="searchTerm = null"
        ><i class="material-icons">cancel</i></span>
      </div>
      <ul
        class="results no-results"
        v-if="!results.length && searchTerm"
      >
        <li>No Results</li>
      </ul>
      <ul
        class="results"
        v-if="!results.length && !searchTerm && historyResults.length"
      >
        <li
          class="result-item"
          v-for="(blob, idx) in historyResults"
          :key="idx"
          :class="{selected: idx === selectedItem}"
          @click.prevent="handleHistoryClick($event, blob)"
        >
          <table-icon
            v-if="blob.tabType === 'table' || blob.tabDetails?.tabType === 'table'"
            :table="blob"
          />
          <i
            class="material-icons item-icon query"
            v-else-if="blob.tabType === 'table-properties' || blob.tabDetails?.tabType === 'table-properties'"
          >construction</i>
          <i
            class="material-icons item-icon connection"
            v-else-if="blob.tabType === 'connection' || blob.tabDetails?.tabType === 'connection'"
          >power</i>
          <i
            class="material-icons item-icon database"
            v-else-if="blob.tabType === 'database' || blob.tabDetails?.tabType === 'database'"
          >storage</i>
          <i
            class="material-icons item-icon database"
            v-else
          >code</i>
          <span class="truncate" v-html="highlightHistory(blob)" />
        </li>
      </ul>
      <div
        class="results empty"
        v-if="!results.length && !searchTerm"
      >
        <p>Type a table name or query name</p>
        <div class="shortcut-item">
          <div>Open </div>
          <div class="shortcut">
            <span>Enter</span>
          </div>
        </div>
        <div class="shortcut-item">
          <div>Alt Open</div>
          <div class="shortcut">
            <span v-if="this.$config.isMac">Cmd</span>
            <span v-if="!this.$config.isMac">Ctrl</span>
            <span>Enter</span>
          </div>
          <span class="hint">(tables only)</span>
        </div>
        <div class="shortcut-item">
          <div>Open In Background</div>
          <div class="shortcut">
            <!-- <span v-if="this.$config.isMac">Cmd</span>
            <span v-if="!this.$config.isMac">Ctrl</span> -->
            <span>Right Arrow</span>
          </div>
          <span class="hint">(tables only)</span>
        </div>
        <div class="shortcut-item">
          <div>Alt In Background</div>
          <div class="shortcut">
            <span v-if="this.$config.isMac">Cmd</span>
            <span v-if="!this.$config.isMac">Ctrl</span>
            <span>Right Arrow</span>
          </div>
          <span class="hint">(tables only)</span>
        </div>
      </div>
      <ul
        class="results"
        v-if="results && results.length"
      >
        <li
          class="result-item"
          v-for="(blob, idx) in results"
          :key="idx"
          :class="{selected: idx === selectedItem}"
          @click.prevent="handleClick($event, blob)"
        >
          <table-icon
            v-if="blob.type === 'table'"
            :table="blob.item"
          />
          <i
            class="material-icons item-icon query"
            v-if="blob.type === 'query'"
          >code</i>
          <i
            class="material-icons item-icon connection"
            v-if="blob.type === 'connection'"
          >power</i>
          <i
            class="material-icons item-icon database"
            v-if="blob.type === 'database'"
          >storage</i>
          <span v-html="highlight(blob)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import { AppEvent } from '@/common/AppEvent'
import TableIcon from '@/components/common/TableIcon.vue'
import { escapeHtml } from '@shared/lib/tabulator'
export default Vue.extend({
  components: { TableIcon },
  mounted() {
    document.addEventListener('mousedown', this.maybeHide)
    this.$nextTick(() => {
      this.$refs.searchBox.focus()
      this.getTabHistory()
    })
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.maybeHide)
  },
  data() {
    return {
      active: false,
      searchTerm: null,
      results: [],
      selectedItem: 0,
      historyResults: []
    }
  },
  watch: {
    selectedItem() {
      if (this.selectedItem < 0) {
        this.selectedItem = Math.max(0, this.results.length - 1)
      } else if (this.results.length && this.selectedItem >= this.results.length) {
        this.selectedItem = 0
      }

    },
    async searchTerm() {
      if (this.searchTerm) {
        const ids: any[] = await this.searchIndex.searchAsync(this.searchTerm, 20)
        this.results = this.database.filter((blob) => ids.includes(blob.id))

        if (this.selectedItem >= this.results.length) this.selectedItem = this.results.length - 1
      } else {
        this.results = []
        this.selectedItem = 0
      }
    },

  },
  computed: {
    ...mapState(['usedConfig']),
    ...mapState('search', ['searchIndex']),
    ...mapGetters({ database: 'search/database'}),
    ...mapState(['tables']),
    ...mapState('tabs', { 'tabs': 'tabs' }),
    elements() {
      if (this.$refs.menu) {
        return Array.from(this.$refs.menu.getElementsByTagName("*"))
      } else {
        return []
      }
    },
    keymap() {
      return this.$vHotkeyKeymap({
        'quickSearch.focusSearch': this.openSearch,
        'quickSearch.close': this.closeSearch,
        'quickSearch.selectUp': this.selectUp,
        'quickSearch.selectDown': this.selectDown,
        'quickSearch.open': this.enter,
        'quickSearch.altOpen': this.metaEnter,
        'quickSearch.openInBackground': this.persistentSearchEnter,
        'quickSearch.altOpenInBackground': this.persistentSearchMetaEnter,
      })
    }
  },
  methods: {
    async getTabHistory() {
      const results = await Vue.prototype.$util.send('appdb/tabhistory/get', { workspaceId: this.usedConfig.workspaceId, connectionId: this.usedConfig.id });
      this.historyResults = results 
    },
    highlight(blob) {
      const dangerous = blob.title
      const text = escapeHtml(dangerous || "unknown item")
      const regex = new RegExp(this.searchTerm.split(/\s+/).filter((i) => i?.length).join("|"), 'gi')
      const result = text.replace(regex, (match) => `<strong>${match}</strong>`)

      return result
    },
    highlightHistory(blob) {
      const dangerous = blob.title
      let historyText = [escapeHtml(dangerous || 'unknown item')]

      if (blob.deletedAt) {
        historyText.push('recently closed')
      }

      return historyText.join(' - ')
    },
    openSearch() {
      this.$nextTick(() => {
        this.$refs.searchBox.focus()
      })
    },
    closeSearch() {
      this.$emit('close')
    },
    selectUp(e: Event) {
      e.stopPropagation()
      this.selectedItem = this.selectedItem - 1
    },
    selectDown(e) {
      e.stopPropagation()
      this.selectedItem = this.selectedItem + 1
    },
    async submit(result, persistSearch = false) {
      if(!result?.item) return
      switch (result.type) {
        case 'table':
          this.$root.$emit(AppEvent.loadTable, {table: result.item})
          break;
        case 'query':
          this.$root.$emit('favoriteClick', result.item)
          break;
        case 'connection':
          await this.$store.dispatch('disconnect')
          try {
            const { auth, cancelled } = await this.$bks.unlock();
            if (cancelled) return;
            await this.$store.dispatch('connect', { config: result.item, auth })
          } catch (ex) {
            this.$noty.error("Error establishing a connection")
            console.error(ex)
          }
          break;
        case 'database':
          this.$store.dispatch('changeDatabase', result.item)
          break;
        default:
          break;
      }
      if (!persistSearch) this.closeSearch()
    },
    submitAlt(result, persistSearch = false) {
      if(!result?.item) return

      if (result.type === 'table') {
        this.$root.$emit(AppEvent.openTableProperties, { table: result.item })
      } else {
        return this.submit(result)
      }
      if (!persistSearch) this.closeSearch()
    },
    async handleHistoryClick(_event: MouseEvent, result: any) {
      this.closeSearch()
      if (result.deletedAt) {
        result.deletedAt = null
        await this.$store.dispatch('tabs/add', { item: result } )
      }

      return await this.$store.dispatch('tabs/setActive', result)
    },
    handleClick(event: MouseEvent, result: any) {
      if (event.ctrlKey) {
        this.submitAlt(result)
      } else {
        this.submit(result)
      }
    },
    enter() {
      let result = this.results[this.selectedItem]
      if (!this.results.length && !this.searchTerm && this.historyResults.length) {
        result = this.historyResults[this.selectedItem]
        this.handleHistoryClick(_, result) 
      } else {
        this.submit(result)
      }
    },
    metaEnter() {
      let result = this.results[this.selectedItem]
      if (!this.results.length && !this.searchTerm && this.historyResults.length) {
        result = this.historyResults[this.selectedItem]
        this.handleHistoryClick(_, result) 
      } else {
        this.submitAlt(result)
      }
    },
    persistentSearchEnter(){
      const cursorPosition = this.$refs.searchBox.selectionStart
      if (this.searchTerm.length === cursorPosition){
        const result = this.results[this.selectedItem]
        this.submit(result, true)
      }
    },
    persistentSearchMetaEnter(){
      const cursorPosition = this.$refs.searchBox.selectionStart
      if (this.searchTerm.length === cursorPosition){
        const result = this.results[this.selectedItem]
        this.submitAlt(result, true)
      }
    },
    maybeHide(event: MouseEvent) {
      const target = event.target
      if (!this.elements.includes(target)) {
        this.closeSearch()
      }
    }

  }
})
</script>
