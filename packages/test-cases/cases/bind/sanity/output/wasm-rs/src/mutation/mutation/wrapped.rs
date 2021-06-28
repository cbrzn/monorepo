pub use super::serialization::{
    deserialize_mutation_method_args, deserialize_object_method_args,
    serialize_mutation_method_result, serialize_object_method_result,
};

pub fn mutation_method_wrapped(args_buf: &[u8]) -> Vec<u8> {
    let query_method = deserialize_mutation_method_args(args_buf).unwrap();
    let args = bincode::serialize(&query_method).unwrap_or_default();
    let result = args.iter().fold(0, |result, &bit| (result << 1) ^ bit) as i32;
    serialize_mutation_method_result(result)
}

pub fn object_method_wrapped(args_buf: &[u8]) -> Vec<u8> {
    let object_method = deserialize_object_method_args(args_buf).unwrap();
    serialize_object_method_result(object_method.opt_object)
}