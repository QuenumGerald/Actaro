[**actaro**](../README.md)

***

[actaro](../README.md) / McpToolAdapter

# Interface: McpToolAdapter\<S, E\>

Defined in: [mcp.ts:5](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L5)

## Type Parameters

### S

`S` *extends* `z.ZodTypeAny`

### E

`E`

## Properties

### call

> **call**: (`input`) => `Awaitable`\<`E`\>

Defined in: [mcp.ts:9](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L9)

#### Parameters

##### input

`TypeOf`\<`S`\>

#### Returns

`Awaitable`\<`E`\>

***

### description?

> `optional` **description?**: `string`

Defined in: [mcp.ts:7](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L7)

***

### idempotencyKey?

> `optional` **idempotencyKey?**: (`input`) => `string`

Defined in: [mcp.ts:11](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L11)

#### Parameters

##### input

`TypeOf`\<`S`\>

#### Returns

`string`

***

### input

> **input**: `S`

Defined in: [mcp.ts:8](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L8)

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: [mcp.ts:12](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L12)

***

### name

> **name**: `string`

Defined in: [mcp.ts:6](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L6)

***

### verify

> **verify**: (`input`, `toolResult`) => `Awaitable`\<[`VerificationResult`](../type-aliases/VerificationResult.md)\>

Defined in: [mcp.ts:10](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/mcp.ts#L10)

#### Parameters

##### input

`TypeOf`\<`S`\>

##### toolResult

`E`

#### Returns

`Awaitable`\<[`VerificationResult`](../type-aliases/VerificationResult.md)\>
