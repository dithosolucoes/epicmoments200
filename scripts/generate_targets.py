import requests
import subprocess
import os
import sys

def download_image(url, output_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    return False

def main():
    # Criar diretório temporário para as imagens
    if not os.path.exists('temp_images'):
        os.makedirs('temp_images')

    # URLs das estampas (você precisa substituir por suas URLs reais)
    stamp_urls = [
        "URL_DA_ESTAMPA_1",
        "URL_DA_ESTAMPA_2"
    ]

    # Download das imagens
    image_paths = []
    for i, url in enumerate(stamp_urls):
        output_path = f'temp_images/stamp_{i}.jpg'
        if download_image(url, output_path):
            image_paths.append(output_path)

    if not image_paths:
        print("Nenhuma imagem foi baixada!")
        return

    # Gerar arquivo mind
    cmd = ['npx', 'mindar-cli', 'compile'] + image_paths + ['-o', '../public/targets.mind']
    subprocess.run(cmd)

    # Limpar arquivos temporários
    for path in image_paths:
        os.remove(path)
    os.rmdir('temp_images')

if __name__ == "__main__":
    main()
