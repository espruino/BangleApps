class AppsJsonPage < Jekyll::Page
  def initialize(site)
    @site = site
    @base = site.source
    @basename = 'apps'
    @ext = '.json'
    @name = 'apps.json'
    @data = {}
  end
end

# Generates the apps.json
# out of all the /apps/*/metadata.json files
class Generator < Jekyll::Generator
  safe true

  def generate(site)
    metadatas = site.static_files.select { |file| file.name == 'metadata.json' }
    json = metadatas.map { |file| JSON.load(open(file.path)) }
    appsjson = AppsJsonPage.new(site)
    open(appsjson.path, 'wb') do |file|
      file << JSON.generate(json)
    end
    site.pages << appsjson
  end
end
