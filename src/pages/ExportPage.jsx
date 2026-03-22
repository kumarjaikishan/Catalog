import { useNavigate } from 'react-router-dom'
import PdfThemeExportFlow from '../ui/PdfThemeExportFlow'

const ExportPage = ({ catalog }) => {
  const navigate = useNavigate()

  return <PdfThemeExportFlow catalog={catalog} onClose={() => navigate('/')} />
}

export default ExportPage
