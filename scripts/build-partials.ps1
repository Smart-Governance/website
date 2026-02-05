$root = Split-Path -Parent $PSScriptRoot
$headerTemplate = Get-Content -Path (Join-Path $root 'partials\header.html') -Raw -Encoding utf8
$footerTemplate = Get-Content -Path (Join-Path $root 'partials\footer.html') -Raw -Encoding utf8

$pages = @(
  @{ File = 'index.html'; Lang = 'en' },
  @{ File = 'contact.html'; Lang = 'en' },
  @{ File = 'service.html'; Lang = 'en' },
  @{ File = 'service-overview.html'; Lang = 'en' },
  @{ File = 'ar\index.html'; Lang = 'ar' },
  @{ File = 'ar\contact.html'; Lang = 'ar' },
  @{ File = 'ar\service.html'; Lang = 'ar' },
  @{ File = 'ar\service-overview.html'; Lang = 'ar' }
)

function Get-Tokens($lang) {
  function U([int[]]$codes) {
    return -join ($codes | ForEach-Object { [char]$_ })
  }

  if ($lang -eq 'ar') {
    $homeLabel = U @(0x0627,0x0644,0x0631,0x0626,0x064A,0x0633,0x064A,0x0629) # الرئيسية
    $aboutLabel = U @(0x0645,0x0646,0x0020,0x0646,0x062D,0x0646) # من نحن
    $servicesLabel = U @(0x062E,0x062F,0x0645,0x0627,0x062A,0x0646,0x0627) # خدماتنا
    $contactLabel = U @(0x062A,0x0648,0x0627,0x0635,0x0644,0x0020,0x0645,0x0639,0x0646,0x0627) # تواصل معنا

    return @{
      HOME_URL = '/ar/index.html#home'
      ABOUT_URL = '/ar/index.html#about'
      SERVICES_URL = '/ar/index.html#services'
      CONTACT_URL = '/ar/contact.html#contact'
      CTA_URL = '/ar/contact.html#contact'
      LANG_SWITCH_URL = '/index.html'
      LANG_SWITCH_LABEL = 'EN'
      HOME_LABEL = $homeLabel
      ABOUT_LABEL = $aboutLabel
      SERVICES_LABEL = $servicesLabel
      CONTACT_LABEL = $contactLabel
      CTA_LABEL = $contactLabel
    }
  }

  return @{
    HOME_URL = 'index.html#home'
    ABOUT_URL = 'index.html#about'
    SERVICES_URL = 'index.html#services'
    CONTACT_URL = 'contact.html#contact'
    CTA_URL = 'contact.html#contact'
    LANG_SWITCH_URL = '/ar/index.html'
    LANG_SWITCH_LABEL = 'AR'
    HOME_LABEL = 'HOME'
    ABOUT_LABEL = 'ABOUT US'
    SERVICES_LABEL = 'SERVICES'
    CONTACT_LABEL = 'CONTACT'
    CTA_LABEL = 'Get an Appointment'
  }
}

function Apply-Tokens($template, $tokens) {
  $result = $template
  foreach ($key in $tokens.Keys) {
    $pattern = [regex]::Escape("{{$key}}")
    $result = $result -replace $pattern, $tokens[$key]
  }
  return $result
}

function Wrap-Partial($name, $content) {
  return "<!-- PARTIAL:$name -->`n$content`n<!-- /PARTIAL:$name -->"
}

function Replace-Or-Insert($html, $name, $content, $fallbackPattern) {
  $markerPattern = "<!-- PARTIAL:$name -->[\s\S]*?<!-- /PARTIAL:$name -->"
  $wrapped = Wrap-Partial $name $content
  if ($html -match $markerPattern) {
    return [regex]::Replace($html, $markerPattern, { $wrapped })
  }
  if ($fallbackPattern -and $html -match $fallbackPattern) {
    return [regex]::Replace($html, $fallbackPattern, { $wrapped })
  }
  return $html
}

foreach ($page in $pages) {
  $pagePath = Join-Path $root $page.File
  if (-not (Test-Path $pagePath)) { continue }

  $tokens = Get-Tokens $page.Lang
  $header = Apply-Tokens $headerTemplate $tokens
  $footer = Apply-Tokens $footerTemplate $tokens

  $html = Get-Content -Path $pagePath -Raw -Encoding utf8
  $html = Replace-Or-Insert $html 'header' $header '<header[\s\S]*?</header>'
  $html = Replace-Or-Insert $html 'footer' $footer '<footer[\s\S]*?</footer>'

  Set-Content -Path $pagePath -Value $html -Encoding utf8
  Write-Host "Updated $($page.File)"
}
