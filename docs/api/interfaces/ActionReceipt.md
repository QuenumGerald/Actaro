[**actaro**](../README.md)

***

[actaro](../README.md) / ActionReceipt

# Interface: ActionReceipt

Defined in: [types.ts:22](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L22)

## Properties

### action

> **action**: `object`

Defined in: [types.ts:24](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L24)

#### description?

> `optional` **description?**: `string`

#### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

#### metadata?

> `optional` **metadata?**: [`JsonValue`](../type-aliases/JsonValue.md)

#### name

> **name**: `string`

***

### attempts

> **attempts**: `number`

Defined in: [types.ts:28](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L28)

***

### completedAt

> **completedAt**: `string`

Defined in: [types.ts:27](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L27)

***

### evidence?

> `optional` **evidence?**: [`JsonValue`](../type-aliases/JsonValue.md)

Defined in: [types.ts:32](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L32)

***

### execution?

> `optional` **execution?**: `object`

Defined in: [types.ts:30](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L30)

#### completedAt

> **completedAt**: `string`

#### error?

> `optional` **error?**: `string`

#### output?

> `optional` **output?**: [`JsonValue`](../type-aliases/JsonValue.md)

***

### id

> **id**: `string`

Defined in: [types.ts:23](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L23)

***

### input

> **input**: [`JsonValue`](../type-aliases/JsonValue.md)

Defined in: [types.ts:29](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L29)

***

### reason?

> `optional` **reason?**: `string`

Defined in: [types.ts:33](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L33)

***

### startedAt

> **startedAt**: `string`

Defined in: [types.ts:26](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L26)

***

### status

> **status**: `"verified"` \| `"pending"` \| `"failed"`

Defined in: [types.ts:25](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L25)

***

### verification?

> `optional` **verification?**: `object`

Defined in: [types.ts:31](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L31)

#### checkedAt

> **checkedAt**: `string`

#### status

> **status**: `"verified"` \| `"pending"` \| `"failed"`
