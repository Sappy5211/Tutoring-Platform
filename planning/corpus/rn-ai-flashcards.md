[Skip to main content](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#main-content)

# Generating Flashcards with AI

You can quickly create flashcards from text you paste into RemNote.

Written by Soren Bjornstad
Updated this week

Table of contents

[Generating flashcards](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_fd018ce82e)[Configuration options](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_52db9bea2d)[Reviewing and saving generated cards](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_fcf1474143)

[Creating flashcards](https://help.remnote.com/en/articles/6025481-creating-flashcards) is one of the most difficult and time-consuming parts of using RemNote. While you'll almost always get the best results by writing your own flashcards, you may simply not have the time to write your own flashcards on every topic you want to learn. When the choice is between no flashcards or somewhat worse flashcards, **automatically generating flashcards** using a large language model is a great option.

![The Generate Flashcards dialog with a Level Of Detail choice on the left, including the recommended Important Ideas option, and the generated flashcards on the right with checkboxes and save or discard buttons.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2565139247/ba1275b3de63edcf28aa85ce2963/CleanShot+2026-07-25+at+12_55_30%402x.png?expires=1788118200&signature=b394214825f0661198b630bc5a8e8c203a71bf20dbca2cf3e43ac7745d2f2d92&req=diUhE8h9lINbXvMW1HO4zcX0lNjTmHaLgdq3hklJR7bMREPK3Ygs0mPfUNYV%0AC3BlhI%2BzMmoGRu2ixFU%3D%0A)

# Generating flashcards

To start creating flashcards with AI, paste some text you want to learn about, then select it and click the _Create AI Cards_ button on the toolbar.

![A passage of pasted text selected in the editor, with a red box around the Create AI Cards button on the toolbar above it.](https://downloads.intercomcdn.com/i/o/akxf7g7x/1244631761/1b1d21affb7340241216dc4d54a5/image.png?expires=1788118200&signature=fbb5635026a814e0c578f249e8968c8aaff2bf00f463b6d61cff04de0c28e2fc&req=dSIjEs99nIZZWPMW1HO4zZ7YTx46PjbVOcabCxm1PHMbsdAlJVfZW%2Bs%2BJ7Bv%0AxYj%2FINqy%2BIN3snu7do0%3D%0A)

**Tip**:AI flashcard generation reads the images in the notes you select, so diagrams, screenshots, and other visuals in your selection can inform the flashcards it writes. This works the same way in the [AI Tutor](https://help.remnote.com/en/articles/10103884-ai-tutor-chat).

After you click the button, a configuration screen opens. Choose your settings (see below), or click _Generate Cards Now_ to generate a set of flashcards with the same settings you used the last time you generated flashcards.

![The configuration screen, where each Level of Detail option lists its estimated card count and credit cost, with Important ideas selected as Recommended above the Generate Cards Now button.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2544292578/222e1894d861777c5838e6bbd23d/03-CleanShot_2026-03-19_at_16_51_55_402x.png?expires=1788118200&signature=386d4e3e207f6ef01ef94fe07d9a574956bcca1beb57b1f35f0270b14b50b8ba&req=diUjEst3n4RYUfMW1HO4zReLgC5t6J60NU0HG1egFnX1galumjZ3ASfFTk6K%0ANFthdoxohfWsvilm%2FVA%3D%0A)

# Configuration options

At the top of the configuration screen, choose whether to generate standard **flashcards** or a **Multiple-Choice Quiz**.

The **Sections** field controls how much of your document is included in generation. Click the edit icon next to it to adjust the range. This can be especially helpful if you have a large text that covers multiple topics, and you only want to focus on one topic for now.

The **Level of Detail** setting controls how many cards it produces. Each option shows the estimated card count and [AI credit](https://help.remnote.com/en/articles/9416169-ai-credits) cost:

- **High-level summary**: Generates cards from an AI summary of the text. Good for a quick overview of a topic.

- **Important ideas**: Generates cards from the full text, focusing on key concepts. This is the recommended option for most use cases.

- **Exhaustive detail**: Generates cards from the full text with maximum coverage. Best when you want comprehensive flashcard coverage of a topic.


The **Generation Options** setting gives you these options to tweak the flashcards:

- **Card Types**:Control which types of flashcards the AI is allowed to use.

- **Card Language**:By default, RemNote will try to automatically detect the language used in the pasted text and write flashcards in that language. If this fails for some reason, or you would like your cards in a different language than you were reading in, pick a supported language here.

- **Model**:By default, a large or a medium-sized AI model will be used. If this uses too many AI credits for you, you may be able to get a good result with a smaller model. Smaller models also tend to write more straightforward, factual questions, so in a few cases they may actually be preferable, depending on what you are trying to learn. However, they may also follow instructions less accurately.


The **Advanced** section lets you:

- **Add custom instructions** to further tweak your cards. You can include information about what you're studying, what kinds of flashcards you want, and so on – they'll be passed directly to the model.

- **Add cards in a portal**: This option below the flashcards turns each [Concept](https://help.remnote.com/en/articles/6026154-structuring-knowledge-with-the-concept-descriptor-framework) in the generated flashcards into a top-level bullet and [portals](https://help.remnote.com/en/articles/6030742-portals) it in to the current document, rather than placing the Concepts directly in the current document. If you expect to see the same topics covered repeatedly in different sources you learn from, this may help you reduce the number of duplicate flashcards accidentally created testing the same thing, and keep all relevant information in one place. (See the portals article linked above for more details.)


# Reviewing and saving generated cards

After you click _Generate Cards Now_, RemNote generates a set of flashcards and shows you a preview. On the right, you'll see the generated cards that will be added to your document. Uncheck any cards you don't want to keep.

![The preview after generating, listing the proposed cards on the right with two of them unchecked so they will not be added.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2544293100/6321969e575baaaf62e7da5c89d7/04-CleanShot_2026-03-19_at_17_05_00_402x.png?expires=1788118200&signature=b59da7d1ee36d73593c20a4895f3ab6848d8897e0f7be253d09458a0fa3faa31&req=diUjEst3noBfWfMW1HO4zbOzjtIwwx3a%2BsZum%2BPr9yqk9WBCwh9UIXKmTasP%0AE06v733nnpYNhr%2Bnqn0%3D%0A)

**Note**: If you have already generated cards from the same text with the same settings, RemNote reuses that result rather than running the AI again, and the generation is free.

Once you choose one of the save options ( _Save Cards & Keep Text_ or _Save & Replace Text_), the generated cards are inserted into your document. From here, you can paste another passage and generate cards from that, start practicing, or edit them just like you could any other flashcards.

**Note:** When you generate flashcards with AI, they aren't immediately scheduled under your due cards. Instead, they automatically fall under Need to Learn.

This routes these unpracticed cards into a separate queue, keeping you in full control of when to introduce large batches of new material into your regular spaced-repetition practice. When you're ready to start studying them, press the _Learn new_ button.

![A folder page with the 'Learn New' button in the Currently Studying banner outlined in red, which is where generated cards wait to be learned.](https://downloads.intercomcdn.com/i/o/akxf7g7x/2561414793/70f23a3c2b2158dc050fcf8b238f/CleanShot+2026-07-23+at+17_48_22%402x.png?expires=1788118200&signature=091585f5817910a0f79b4344b117268df17d704c370f77792c55eb4b617d5a9e&req=diUhF81%2FmYZWWvMW1HO4zeS%2BoAk5Fj1fLIZ0EukOTXS3V6BDulZ8bCMg%2Fzot%0A3NKiwljpz2zts36RuS8%3D%0A)

The most effective way to use AI flashcards is to treat them as a starting point, rather than as your final set of flashcards on a topic. That's because exactly what prompt on the front of a flashcard is perfectly clear varies from person to person, so it's likely that some of them will be written in a way that slightly confuses you. Feel free to edit the cards as you discover things that could be better!

* * *

Related Articles

- [Can I pause the flashcards scheduler?](https://help.remnote.com/en/articles/7967414-can-i-pause-the-flashcards-scheduler)
- [Flashcard Basics](https://help.remnote.com/en/articles/8663109-flashcard-basics)
- [How to Import Flashcards from Text](https://help.remnote.com/en/articles/9252072-how-to-import-flashcards-from-text)
- [Flashcard Insights](https://help.remnote.com/en/articles/10103365-flashcard-insights)
- [Generating Flashcards from Tables](https://help.remnote.com/en/articles/13869879-generating-flashcards-from-tables)

Did this answer your question?

😞😐😃

Table of contents

[Generating flashcards](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_fd018ce82e)[Configuration options](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_52db9bea2d)[Reviewing and saving generated cards](https://help.remnote.com/en/articles/10102901-generating-flashcards-with-ai#h_fcf1474143)