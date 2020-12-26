'use strict';

function Transaction() {}

Transaction.start = data => {
    console.log('\nstart transaction');
    let delta = {};

    const methods = {
        commit: () => {
            console.log('\ncommit transaction');
            Object.assign(data, delta);
            delta = {};
        },
        rollback: () => {
            console.log('\nrollback transaction');
            delta = {};
        },
        clone: () => {
            console.log('\nclone transaction');
            const cloned = Transaction.start(data);
            Object.assign(cloned.delta, delta);
            return cloned;
        }
    };

    return new Proxy(data, {
        get(target, key) {
            if (key === 'delta') return delta;
            if (methods.hasOwnProperty(key)) return methods[key];
            if (delta.hasOwnProperty(key)) return delta[key];
            return target[key];
        },

        getOwnPropertyDescriptor: (target, key) => (
            Object.getOwnPropertyDescriptor(
                delta.hasOwnProperty(key) ? delta : target, key
            )
        ),

        ownKeys() {
            const changes = Object.keys(delta);
            const keys = Object.keys(data).concat(changes);
            return keys.filter((x, i, a) => a.indexOf(x) === i);
        },

        set(target, key, val) {
            console.log('set', key, val);
            if (target[key] === val) delete delta[key];
            else delta[key] = val;
            return true;
        }
    });
};

// Usage

const data = { name: 'Marcus Aurelius', born: 121 };

const transaction = Transaction.start(data);
console.dir({ data });

transaction.name = 'Mao Zedong';
transaction.born = 1893;
transaction.city = 'Shaoshan';
transaction.age = (
    new Date().getFullYear() -
    new Date(transaction.born + '').getFullYear()
);

console.dir({ transaction });
console.dir({ delta: transaction.delta });

const transaction2 = transaction.clone();

transaction.commit();
console.dir({ data });
console.dir({ transaction });
console.dir({ transaction2 });
console.dir({ delta: transaction.delta });
console.dir({ delta: transaction2.delta });

transaction.rollback();
console.dir({ data });
console.dir({ transaction });
console.dir({ delta: transaction.delta });