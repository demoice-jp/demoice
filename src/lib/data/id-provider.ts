const idProvider = {
  line: "LINE",
};

export default class IdProvider {
  static getName(provider?: string) {
    if (!provider || !(provider in idProvider)) {
      return "不明なIDプロバイダ";
    }
    return idProvider[provider as keyof typeof idProvider];
  }

  static validateProviderId(provider: string): keyof typeof idProvider {
    if (!(provider in idProvider)) {
      throw new Error("無効なIDプロバイダ");
    }
    return provider as keyof typeof idProvider;
  }
}
