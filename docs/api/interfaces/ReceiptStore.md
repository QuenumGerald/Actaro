[**actaro**](../README.md)

***

[actaro](../README.md) / ReceiptStore

# Interface: ReceiptStore

Defined in: [types.ts:36](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L36)

## Methods

### get()

> **get**(`id`): `Promise`\<[`ActionReceipt`](ActionReceipt.md) \| `undefined`\>

Defined in: [types.ts:38](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L38)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`ActionReceipt`](ActionReceipt.md) \| `undefined`\>

***

### getByIdempotencyKey()?

> `optional` **getByIdempotencyKey**(`actionName`, `idempotencyKey`): `Promise`\<[`ActionReceipt`](ActionReceipt.md) \| `undefined`\>

Defined in: [types.ts:39](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L39)

#### Parameters

##### actionName

`string`

##### idempotencyKey

`string`

#### Returns

`Promise`\<[`ActionReceipt`](ActionReceipt.md) \| `undefined`\>

***

### list()

> **list**(): `Promise`\<[`ActionReceipt`](ActionReceipt.md)[]\>

Defined in: [types.ts:40](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L40)

#### Returns

`Promise`\<[`ActionReceipt`](ActionReceipt.md)[]\>

***

### save()

> **save**(`receipt`): `Promise`\<`void`\>

Defined in: [types.ts:37](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L37)

#### Parameters

##### receipt

[`ActionReceipt`](ActionReceipt.md)

#### Returns

`Promise`\<`void`\>
