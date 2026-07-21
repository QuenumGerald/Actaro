[**actaro**](../README.md)

***

[actaro](../README.md) / actaro

# Variable: actaro

> `const` **actaro**: `object`

Defined in: [core.ts:168](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/core.ts#L168)

## Type Declaration

### store

> **store**: [`ReceiptStore`](../interfaces/ReceiptStore.md)

### run()

> **run**\<`S`, `E`\>(`action`, `rawInput`, `runOptions?`): `Promise`\<[`ActionReceipt`](../interfaces/ActionReceipt.md)\>

#### Type Parameters

##### S

`S` *extends* `ZodTypeAny`

##### E

`E`

#### Parameters

##### action

[`ActionDefinition`](../interfaces/ActionDefinition.md)\<`S`, `E`\>

##### rawInput

`input`\<`S`\>

##### runOptions?

[`RunOptions`](../interfaces/RunOptions.md) = `{}`

#### Returns

`Promise`\<[`ActionReceipt`](../interfaces/ActionReceipt.md)\>
