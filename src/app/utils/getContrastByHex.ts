
export function GetContrastByHex(hexCode: string) {
    const code = hexCode.replace("#", '');
    const rgb = {
        red: parseInt(code.substr(0, 2), 16),
        green: parseInt(code.substr(2, 2), 16),
        blue: parseInt(code.substr(4, 2), 16)
    };
    const brightness = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;
    const contrast = brightness > 256 / 2 ? '#000000' : '#FFFFFF';
    return contrast;
}