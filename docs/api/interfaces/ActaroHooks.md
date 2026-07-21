[**actaro**](../README.md)

***

[actaro](../README.md) / ActaroHooks

# Interface: ActaroHooks

Defined in: [types.ts:43](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L43)

## Properties

### executionFinished?

> `optional` **executionFinished?**: (`context`) => `Awaitable`\<`void`\>

Defined in: [types.ts:45](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L45)

#### Parameters

##### context

###### action

`string`

###### error?

`Error`

###### output?

`unknown`

#### Returns

`Awaitable`\<`void`\>

***

### executionStarted?

> `optional` **executionStarted?**: (`context`) => `Awaitable`\<`void`\>

Defined in: [types.ts:44](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L44)

#### Parameters

##### context

###### action

`string`

###### input

`unknown`

#### Returns

`Awaitable`\<`void`\>

***

### receiptCreated?

> `optional` **receiptCreated?**: (`receipt`) => `Awaitable`\<`void`\>

Defined in: [types.ts:51](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L51)

#### Parameters

##### receipt

[`ActionReceipt`](ActionReceipt.md)

#### Returns

`Awaitable`\<`void`\>

***

### verificationAttempt?

> `optional` **verificationAttempt?**: (`context`) => `Awaitable`\<`void`\>

Defined in: [types.ts:50](https://github.com/QuenumGerald/Actaro/blob/495ef70f0f301c20e102650870ada0dccfc2e6b2/src/types.ts#L50)

#### Parameters

##### context

###### action

`string`

###### attempt

`number`

#### Returns

`Awaitable`\<`void`\>
