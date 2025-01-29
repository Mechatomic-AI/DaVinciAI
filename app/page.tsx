'use client'

import { AuthDialog } from '@/components/auth-dialog'
import { Chat } from '@/components/chat'
import { ChatInput } from '@/components/chat-input'
import { ChatPicker } from '@/components/chat-picker'
import { ChatSettings } from '@/components/chat-settings'
import { NavBar } from '@/components/navbar'
import { Preview } from '@/components/preview'
import { AuthViewType, useAuth } from '@/lib/auth'
import { Message, toAISDKMessages, toMessageImage } from '@/lib/messages'
import { LLMModelConfig } from '@/lib/models'
import modelsList from '@/lib/models.json'
import { DaVinciSchema, fragmentSchema as schema } from '@/lib/schema'
import { supabase } from '@/lib/supabase'
import templates, { TemplateId } from '@/lib/templates'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { experimental_useObject as useObject } from 'ai/react'
import { usePostHog } from 'posthog-js/react'
import { SetStateAction, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { BackgroundShader } from '@/components/background-shader'

export default function Home() {
  const [chatInput, setChatInput] = useLocalStorage('chat', '')
  const [files, setFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<'auto' | TemplateId>(
    'auto',
  )
  const [languageModel, setLanguageModel] = useLocalStorage<LLMModelConfig>(
    'languageModel',
    {
      model: 'claude-3-5-sonnet-latest',
    },
  )

  const posthog = usePostHog()

  const [result, setResult] = useState<ExecutionResult>()
  const [messages, setMessages] = useState<Message[]>([])
  const [fragment, setDaVinci] = useState<DeepPartial<DaVinciSchema>>()
  const [currentTab, setCurrentTab] = useState<'code' | 'fragment'>('code')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isAuthDialogOpen, setAuthDialog] = useState(false)
  const [authView, setAuthView] = useState<AuthViewType>('sign_in')
  const [isRateLimited, setIsRateLimited] = useState(false)
  const { session, apiKey } = useAuth(setAuthDialog, setAuthView)

  const currentModel = modelsList.models.find(
    (model) => model.id === languageModel.model,
  )
  const currentTemplate =
    selectedTemplate === 'auto'
      ? templates
      : { [selectedTemplate]: templates[selectedTemplate] }
  const lastMessage = messages[messages.length - 1]

  const { object, submit, isLoading, stop, error } = useObject({
    api: '/api/chat',
    schema,
    onError: (error) => {
      if (error.message.includes('request limit')) {
        setIsRateLimited(true)
      }
    },
    onFinish: async ({ object: fragment, error }) => {
      if (!error) {
        // send it to /api/sandbox
        console.log('fragment', fragment)
        setIsPreviewLoading(true)
        posthog.capture('fragment_generated', {
          template: fragment?.template,
        })

        const response = await fetch('/api/sandbox', {
          method: 'POST',
          body: JSON.stringify({
            fragment,
            userID: session?.user?.id,
            apiKey,
          }),
        })

        const result = await response.json()
        console.log('result', result)
        posthog.capture('sandbox_created', { url: result.url })

        setResult(result)
        setCurrentPreview({ fragment, result })
        setMessage({ result })
        setCurrentTab('fragment')
        setIsPreviewLoading(false)
      }
    },
  })

  useEffect(() => {
    if (object) {
      setDaVinci(object)
      const content: Message['content'] = [
        { type: 'text', text: object.commentary || '' },
        { type: 'code', text: object.code || '' },
      ]

      if (!lastMessage || lastMessage.role !== 'assistant') {
        addMessage({
          role: 'assistant',
          content,
          object,
        })
      }

      if (lastMessage && lastMessage.role === 'assistant') {
        setMessage({
          content,
          object,
        })
      }
    }
  }, [object])

  useEffect(() => {
    if (error) stop()
  }, [error])

  function setMessage(message: Partial<Message>, index?: number) {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages]
      updatedMessages[index ?? previousMessages.length - 1] = {
        ...previousMessages[index ?? previousMessages.length - 1],
        ...message,
      }

      return updatedMessages
    })
  }

  async function handleSubmitAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!session) {
      return setAuthDialog(true)
    }

    if (isLoading) {
      stop()
    }

    const content: Message['content'] = [{ type: 'text', text: chatInput }]
    const images = await toMessageImage(files)

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: 'image', image })
      })
    }

    const updatedMessages = addMessage({
      role: 'user',
      content,
    })

    submit({
      userID: session?.user?.id,
      messages: toAISDKMessages(updatedMessages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })

    setChatInput('')
    setFiles([])
    setCurrentTab('code')

    posthog.capture('chat_submit', {
      template: selectedTemplate,
      model: languageModel.model,
    })
  }

  function retry() {
    submit({
      userID: session?.user?.id,
      messages: toAISDKMessages(messages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })
  }

  function addMessage(message: Message) {
    setMessages((previousMessages) => [...previousMessages, message])
    return [...messages, message]
  }

  function handleSaveInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value)
  }

  function handleFileChange(change: SetStateAction<File[]>) {
    setFiles(change)
  }

  function logout() {
    supabase
      ? supabase.auth.signOut()
      : console.warn('Supabase is not initialized')
  }

  function handleLanguageModelChange(e: LLMModelConfig) {
    setLanguageModel({ ...languageModel, ...e })
  }

  function handleSocialClick(target: 'github' | 'x' | 'telegram') {
    if (target === 'github') {
      window.open('https://github.com/Mechatomic-AI/DaVinciAI', '_blank')
    } else if (target === 'x') {
      window.open('https://x.com/Da_Vinci_AI_', '_blank')
    } else if (target === 'telegram') {
      window.open('https://t.me/DaVinciAIPortal', '_blank')
    }

    posthog.capture(`${target}_click`)
  }

  function handleClearChat() {
    stop()
    setChatInput('')
    setFiles([])
    setMessages([])
    setDaVinci(undefined)
    setResult(undefined)
    setCurrentTab('code')
    setIsPreviewLoading(false)
  }

  function setCurrentPreview(preview: {
    fragment: DeepPartial<DaVinciSchema> | undefined
    result: ExecutionResult | undefined
  }) {
    setDaVinci(preview.fragment)
    setResult(preview.result)
  }

  function handleUndo() {
    setMessages((previousMessages) => [...previousMessages.slice(0, -2)])
    setCurrentPreview({ fragment: undefined, result: undefined })
  }

  return (
    <main className="flex min-h-screen relative overflow-hidden">
      <BackgroundShader />
      {supabase && (
        <AuthDialog
          open={isAuthDialogOpen}
          setOpen={setAuthDialog}
          view={authView}
          supabase={supabase}
        />
      )}

      <div className={`grid w-full transition-all duration-300 ${fragment ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        <div className={`flex flex-col ${!fragment && 'max-w-5xl mx-auto'} w-full px-4`}>
          <NavBar
            session={session}
            showLogin={() => setAuthDialog(true)}
            signOut={logout}
            onSocialClick={handleSocialClick}
            onClear={handleClearChat}
            canClear={messages.length > 0}
            canUndo={messages.length > 1 && !isLoading}
            onUndo={handleUndo}
          />

          {/* Main Content */}
          <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] -mt-8">
            {/* Chat Interface */}
            <div className="w-full max-w-3xl neon-box bg-card/30 backdrop-blur-sm rounded-lg p-6 pt-4">
              <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                <Chat
                  messages={messages}
                  isLoading={isLoading}
                  setCurrentPreview={setCurrentPreview}
                />
              </div>
              <ChatInput
                retry={retry}
                isErrored={error !== undefined}
                isLoading={isLoading}
                isRateLimited={isRateLimited}
                stop={stop}
                input={chatInput}
                handleInputChange={handleSaveInputChange}
                handleSubmit={handleSubmitAuth}
                isMultiModal={true}
                files={files}
                handleFileChange={setFiles}
              >
                <ChatPicker
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectedTemplateChange={setSelectedTemplate}
                  models={modelsList.models}
                  languageModel={languageModel}
                  onLanguageModelChange={handleLanguageModelChange}
                />
                <ChatSettings
                  languageModel={languageModel}
                  onLanguageModelChange={handleLanguageModelChange}
                  apiKeyConfigurable={!process.env.NEXT_PUBLIC_NO_API_KEY_INPUT}
                  baseURLConfigurable={!process.env.NEXT_PUBLIC_NO_BASE_URL_INPUT}
                />
              </ChatInput>
            </div>

            {/* Title and Subtitle */}
            {messages.length === 0 && !fragment && (
              <div className="text-center mt-16 w-full px-4">
                <div className="max-w-[90vw] mx-auto">
                  <h1 className="text-4xl md:text-8xl neon-glow font-vt323 whitespace-nowrap inline-block transform -translate-x-1/2 relative left-1/2">
                    WHY PAY FOR PREMIUM AI TOOLS?
                  </h1>
                  <p className="neon-glow text-lg md:text-4xl font-vt323 mt-2">
                    DAVINCI AI MAKES THEM ACCESSIBLE TO EVERYONE FOR FREE.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {fragment && (
          <div className="fixed top-0 right-0 w-1/2 h-screen overflow-auto preview-panel-enter">
            <Preview
              apiKey={apiKey}
              selectedTab={currentTab}
              onSelectedTabChange={setCurrentTab}
              isChatLoading={isLoading}
              isPreviewLoading={isPreviewLoading}
              fragment={fragment}
              result={result as ExecutionResult}
              onClose={() => setDaVinci(undefined)}
            />
          </div>
        )}
      </div>
    </main>
  )
}
