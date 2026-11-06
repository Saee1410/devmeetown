import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";


const LANGUAGES = [
    { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

const LanguageSelector = ({ language, setLanguage }) => {
    return (
        <FormControl
      size="small"
      sx={{
        minWidth: 180,
        bgcolor: "#1f2937",
        borderRadius: 2,
      }}
    >
        <InputLabel sx={{ color: "#fff" }}>
        Language
        </InputLabel>

          <Select
        value={language}
        label="Language"
        onChange={(e) => setLanguage(e.target.value)}
        sx={{
          color: "#fff",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "#4b5563",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3b82f6",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },
          ".MuiSvgIcon-root": {
            color: "#fff",
          },
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.value} value={lang.value}>
            {lang.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    );
};

export default LanguageSelector;