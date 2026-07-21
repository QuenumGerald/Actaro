[**actaro**](../README.md)

***

[actaro](../README.md) / ActionDefinition

# Interface: ActionDefinition\<S, E\>

Defined in: [types.ts:12](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L12)

## Type Parameters

### S

`S` *extends* `z.ZodTypeAny` = `z.ZodTypeAny`

### E

`E` = `unknown`

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:14](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L14)

***

### execute

> **execute**: (`input`) => `Awaitable`\<`E`\>

Defined in: [types.ts:16](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L16)

#### Parameters

##### input

`TypeOf`\<`S`\>

#### Returns

`Awaitable`\<`E`\>

***

### idempotencyKey?

> `optional` **idempotencyKey?**: (`input`) => `string`

Defined in: [types.ts:18](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L18)

#### Parameters

##### input

`TypeOf`\<`S`\>

#### Returns

`string`

***

### input

> **input**: `S`

Defined in: [types.ts:15](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L15)

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: [types.ts:19](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L19)

***

### name

> **name**: `string`

Defined in: [types.ts:13](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L13)

***

### verify

> **verify**: (`input`, `execution`) => `Awaitable`\<[`VerificationResult`](../type-aliases/VerificationResult.md)\>

Defined in: [types.ts:17](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L17)

#### Parameters

##### input

`TypeOf`\<`S`\>

##### execution

`E`

#### Returns

`Awaitable`\<[`VerificationResult`](../type-aliases/VerificationResult.md)\>
