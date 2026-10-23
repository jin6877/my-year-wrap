import { useMemo, useState } from 'react'
import { EMPTY_DATA, type WrapData } from './types'
import { getTheme } from './themes'
import { buildSlides, filledCount } from './slides'
import { loadData, loadTheme, saveData, saveTheme } from './storage'
import { SAMPLE_DATA } from './sample'
import InputForm from './components/InputForm'
import StoryViewer from './components/StoryViewer'

export default function App() {
  const [data, setData] = useState<WrapData>(() => loadData())
  const [themeId, setThemeId] = useState<string>(() => loadTheme())
  const [mode, setMode] = useState<'edit' | 'view'>('edit')

  const theme = getTheme(themeId)
  const filled = filledCount(data)
  const slides = useMemo(() => buildSlides(data), [data])

  const updateData = (next: WrapData) => {
    setData(next)
    saveData(next)
  }

  const updateTheme = (id: string) => {
    setThemeId(id)
    saveTheme(id)
  }

  const handleGenerate = () => {
    if (filledCount(data) === 0) {
      // nothing filled -> show a sample card instead of a blank experience
      updateData(SAMPLE_DATA)
    }
    window.scrollTo(0, 0)
    setMode('view')
  }

  const handleFillSample = () => updateData(SAMPLE_DATA)
  const handleReset = () => updateData({ ...EMPTY_DATA })

  if (mode === 'view') {
    return (
      <StoryViewer
        slides={slides}
        theme={theme}
        themeId={themeId}
        onThemeChange={updateTheme}
        onBack={() => setMode('edit')}
      />
    )
  }

  return (
    <InputForm
      data={data}
      onChange={updateData}
      themeId={themeId}
      onThemeChange={updateTheme}
      onGenerate={handleGenerate}
      onFillSample={handleFillSample}
      onReset={handleReset}
      filled={filled}
    />
  )
}
