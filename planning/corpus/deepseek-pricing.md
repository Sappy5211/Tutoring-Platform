[Skip to main content](https://api-docs.deepseek.com/quick_start/pricing/#__docusaurus_skipToContent_fallback)

On this page

# Models & Pricing

The prices listed below are in units of per 1M tokens. A token, the smallest unit of text that the model recognizes, can be a word, a number, or even a punctuation mark. We will bill based on the total number of input and output tokens by the model.

* * *

## Model Details [​](https://api-docs.deepseek.com/quick_start/pricing/\#model-details "Direct link to Model Details")

**|     |     |     |     |     |     |**
**| --- | --- | --- | --- | --- | --- |**
**| MODEL | deepseek-v4-flash | deepseek-v4-pro | deepseek-v4-flash-vision-exp |**
**| BASE URL (OpenAI Format) | [https://api.deepseek.com](https://api.deepseek.com/) |**
**| BASE URL (Anthropic Format) | [https://api.deepseek.com/anthropic](https://api.deepseek.com/anthropic) |**
**| MODEL VERSION | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-Vision-Exp |**
**| THINKING MODE | Supports both non-thinking and thinking (default) modes<br>See [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode) for how to switch |**
**| CONTEXT LENGTH | 1M |**
**| MAX OUTPUT | MAXIMUM: 384K |**
**| FEATURES | [Json Output](https://api-docs.deepseek.com/guides/json_mode) | ✓ | ✓ | ✓ |**
**| [Tool Calls](https://api-docs.deepseek.com/guides/tool_calls) | ✓ | ✓ | ✓ |**
**| [Responses API](https://api-docs.deepseek.com/guides/responses_api) | ✓ | ✓ | ✓ |**
**| [Anthropic API](https://api-docs.deepseek.com/guides/anthropic_api) | ✓ | ✓ | ✓ |**
**| [Chat Prefix Completion（Beta）](https://api-docs.deepseek.com/guides/chat_prefix_completion) | ✓ | ✓ | ✓ |**
**| [FIM Completion（Beta）](https://api-docs.deepseek.com/guides/fim_completion) | Non-thinking mode only | Non-thinking mode only | Not supported |**
**| PRICING(1)(2) | 1M INPUT TOKENS<br>(CACHE HIT) | OFF-PEAK | $0.007 | $0.022 | $0.007 |**
**| PEAK | $0.014 | $0.044 | $0.014 |**
**| 1M INPUT TOKENS<br>(CACHE MISS) | OFF-PEAK | $0.22 | $0.66 | $0.22 |**
**| PEAK | $0.44 | $1.32 | $0.44 |**
**| 1M OUTPUT TOKENS | OFF-PEAK | $0.66 | $1.98 | $0.66 |**
**| PEAK | $1.32 | $3.96 | $1.32 |**
**| Concurrency Limit(3) | 2500 | 500 | 2500 |**

(1) Off-peak rates are half of the peak rates. Peak hours are 01:00 - 04:00 and 06:00 - 10:00 UTC, Monday through Friday (all other hours are off-peak).

(2) Images sent to `deepseek-v4-flash-vision-exp` are converted into tokens based on their dimensions and billed as input tokens together with your text tokens. See [Vision: Token Usage](https://api-docs.deepseek.com/guides/vision#token-usage) for the conversion rule.

(3) For more details on concurrency limits, please refer to [Rate Limit & Isolation](https://api-docs.deepseek.com/quick_start/rate_limit).

* * *

## Deduction Rules [​](https://api-docs.deepseek.com/quick_start/pricing/\#deduction-rules "Direct link to Deduction Rules")

The expense = number of tokens × price.
The corresponding fees will be directly deducted from your topped-up balance or granted balance, with a preference for using the granted balance first when both balances are available.

Product prices may vary and DeepSeek reserves the right to adjust them. We recommend topping up based on your actual usage and regularly checking this page for the most recent pricing information.

- [Model Details](https://api-docs.deepseek.com/quick_start/pricing/#model-details)
- [Deduction Rules](https://api-docs.deepseek.com/quick_start/pricing/#deduction-rules)