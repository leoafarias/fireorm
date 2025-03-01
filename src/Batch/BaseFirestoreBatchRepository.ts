import { CollectionReference } from '@google-cloud/firestore';
import { IEntity, WithOptionalId, Constructor } from '../types';
import { getMetadataStorage, CollectionMetadata, MetadataStorageConfig } from '../MetadataStorage';
import { FirestoreBatchUnit } from './FirestoreBatchUnit';

export class BaseFirestoreBatchRepository<T extends IEntity> {
  protected colMetadata: CollectionMetadata;
  protected subColMetadata: CollectionMetadata[];
  protected collectionPath: string;
  protected colRef: CollectionReference;
  protected config: MetadataStorageConfig;

  constructor(
    protected batch: FirestoreBatchUnit,
    protected entity: Constructor<T>,
    collectionPath?: string
  ) {
    const {
      getCollection,
      getSubCollection,
      getSubCollectionsFromParent,
      firestoreRef,
      config,
    } = getMetadataStorage();

    this.colMetadata = getSubCollection(entity) || getCollection(entity);
    this.subColMetadata = getSubCollectionsFromParent(this.colMetadata.entity);

    this.collectionPath = collectionPath || this.colMetadata.name;
    this.colRef = firestoreRef.collection(this.collectionPath);
    this.config = config;
  }

  create = (item: WithOptionalId<T>) => {
    const doc = item.id ? this.colRef.doc(item.id) : this.colRef.doc();
    if (!item.id) {
      item.id = doc.id;
    }

    this.batch.add(
      'create',
      item as T,
      doc,
      this.colMetadata.entity,
      this.subColMetadata,
      this.config.validateModels
    );
  };

  update = (item: T) => {
    this.batch.add(
      'update',
      item,
      this.colRef.doc(item.id),
      this.colMetadata.entity,
      this.subColMetadata,
      this.config.validateModels
    );
  };

  delete = (item: T) => {
    this.batch.add(
      'delete',
      item,
      this.colRef.doc(item.id),
      this.colMetadata.entity,
      this.subColMetadata,
      this.config.validateModels
    );
  };
}
