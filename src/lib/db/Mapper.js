class MapperError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UndefinedRelationError extends MapperError {}
class MapperNotDefinedError extends MapperError {}

class Mapper {
  constructor(mappers, bookshelf) {
    this.mappers = mappers;
    this.bookshelf = bookshelf;
  }

  static prepareRelations(withRelated) {
    return Object.entries(
      withRelated.reduce((acc, [relation, ...relationWithRelated]) => {
        if (relation) {
          acc[relation] = acc[relation] || [];
          acc[relation].push(relationWithRelated);
        }
        return acc;
      }, {}),
    );
  }

  exposeRecursive(model, { withRelated }) {
    if (!model || model.isNew()) {
      return null;
    }
    if (!this.mappers[model.mapper]) {
      throw new MapperNotDefinedError(`Mapper ${model.mapper} does not exist on model for ${model.constructor.tableName}`);
    }
    const exposedModel = this.mappers[model.mapper].expose(model);

    const relations = Mapper.prepareRelations(withRelated);
    for (const [relation, relationWithRelated] of relations) {
      const relationData = model.related(relation);

      if (relationData instanceof this.bookshelf.Collection) {
        exposedModel[relation] = relationData.map(
          relationElement => this.exposeRecursive(relationElement,
            { withRelated: relationWithRelated }),
        );
      } else if (relationData instanceof this.bookshelf.Model) {
        exposedModel[relation] = this.exposeRecursive(relationData,
          { withRelated: relationWithRelated });
      } else {
        throw new UndefinedRelationError(`Relation ${relation} does not exist on model for ${model.constructor.tableName}`);
      }
    }
    return exposedModel;
  }

  expose(model, { withRelated = [] } = {}) {
    const resolvedWithRelated = withRelated.map(related => related.split('.'));
    return this.exposeRecursive(model, { withRelated: resolvedWithRelated });
  }
}

module.exports = {
  Mapper,
  MapperError,
};
