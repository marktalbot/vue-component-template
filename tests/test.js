import Vue from 'vue';
import test from 'ava'
import MyComponent from '../src/components/MyComponent.vue'

test('Basic component test', t => {
    let N = Vue.extend(MyComponent);

    let vm = new N({
        propsData: {
            message: 'hello'
        }
    }).$mount();

    t.is(vm.$el.textContent.trim(), 'My template is loaded: hello');
});