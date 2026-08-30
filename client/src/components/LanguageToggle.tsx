import { useTranslation } from 'react-i18next';

function LanguageDropdown() {
  const { i18n } = useTranslation();

  const handleChange =  (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="text-shadow-2xs px-2 py-1  rounded-lg bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-700"
    >
      <option value="en">EN</option>
      <option value="ar">AR</option>
      <option value="fr">FR</option>
    </select>
  );
}

export default LanguageDropdown;