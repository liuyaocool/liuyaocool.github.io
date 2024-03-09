const {createApp} = Vue;
const vm = createApp({
    data() {
        return {
            newRadix: 4,
            radixs: {
                2: '0',
                8: '0',
                10: '0',
                16: '0',
            },
        };
    },
    methods: {
        addRadix() {
            if (undefined == this.radixs[this.newRadix]) {
                this.radixs[this.newRadix] = this.radixs[10] ? (this.radixs[10]*1).toString(this.newRadix) : '';
            }
        },
        getFormat(radix, v) {
            if (!v) return v;
            switch (radix*1) {
                case 2: return v.replaceAll(' ', '');
                default: return v;
            }
        },
        setFormat(radix, v) {
            if (!v) return v;
            switch (radix*1) {
                case 2: return v.replace(/(.{4})/g, '$1,').replaceAll(',', ' ').trim();
                default: return v;
            }
        },
        radixInput(radix, newv) {
            let num10 = !newv ? 0 : parseInt(this.getFormat(radix, newv), radix);
            for (const key in this.radixs) {
                this.radixs[key] = (newv && num10) ? this.setFormat(key, num10.toString(key)) : '';
            }
        },
    },
    watch: {
        radixs: { // 这里不能用watch，其他属性改变会再次触发
            handler (newv) {}
        }
    },
    setup() {}
}).mount('#app');
