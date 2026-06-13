# 过敏原矩阵数据结构 Schema

## 版本
- schemaVersion: 1.0
- dataVersion: 2026-06-v1

## 顶层结构

```typescript
interface AllergenData {
  version: string;           // 数据版本号
  updatedAt: string;         // ISO 8601 更新时间
  allergens: Allergen[];     // 过敏原定义数组（列）
  skus: SKU[];               // SKU 产品数组（行）
}
```

## Allergen（过敏原列）

```typescript
interface Allergen {
  key: string;               // 唯一键：gluten | dairy | egg | peanut | treenut | soy | fish | shellfish
  labelZh: string;           // 中文全称
  labelShort: string;        // 中文简称（矩阵表头）
  isHighRisk: boolean;       // 是否为高危过敏原（花生/麸质）
}
```

### 八大过敏原说明

| key        | labelZh | labelShort | isHighRisk | 说明                     |
|------------|---------|------------|------------|--------------------------|
| gluten     | 麸质    | 麸质       | true       | 小麦、大麦、黑麦等含麸质 |
| dairy      | 乳制品  | 乳品       | false      | 牛奶及奶制品             |
| egg        | 蛋类    | 蛋类       | false      | 鸡蛋及蛋制品             |
| peanut     | 花生    | 花生       | true       | 花生及花生制品           |
| treenut    | 坚果    | 坚果       | false      | 树生坚果（核桃、杏仁等） |
| soy        | 大豆    | 大豆       | false      | 大豆及豆制品             |
| fish       | 鱼类    | 鱼类       | false      | 鱼类及鱼制品             |
| shellfish  | 甲壳类  | 甲壳       | false      | 甲壳类（虾、蟹等）       |

## SKU（产品行）

```typescript
interface SKU {
  id: string;                // 唯一 ID
  brand: "kfc" | "mcdonalds" | "华莱士";  // 品牌
  skuCode: string;           // 内部 SKU 编码
  nameZh: string;            // 中文名
  nameEn: string;            // 英文名
  category: string;          // 分类：汉堡 | 小食 | 饮料 | 甜点
  allergens: SKUAllergens;   // 过敏原状态映射
}

interface SKUAllergens {
  [key: string]: AllergenStatus;
}

type AllergenStatus = "Y" | "M" | "N" | "U";
```

### 状态码说明

| 代码 | 中文   | 风险等级 | 说明                                   |
|------|--------|----------|----------------------------------------|
| Y    | 含     | 高危 3   | 明确含有该过敏原                       |
| M    | 可能含 | 中危 2   | 可能含有或存在交叉污染风险             |
| N    | 不含   | 安全 0   | 不含该过敏原                           |
| U    | 未标注 | 未知 1   | 供应商未提供信息，需谨慎对待           |

### 风险等级排序

```
Y (3) > M (2) > U (1) > N (0)
```

## 品牌信息

| 品牌键    | 中文名  | 主题色   |
|-----------|---------|----------|
| kfc       | 肯德基  | #D9000C  |
| mcdonalds | 麦当劳  | #FFC72C  |
| 华莱士    | 华莱士  | #16A34A  |

## 数据验证规则

1. `skus` 数组长度必须为 40（肯德基 14 + 麦当劳 14 + 华莱士 12）
2. 每个 SKU 的 `allergens` 必须包含全部 8 个过敏原 key
3. 状态值只能是 Y/M/N/U 四种
4. `brand` 只能是三个预定义值之一
